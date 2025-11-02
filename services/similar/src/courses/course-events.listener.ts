import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import * as amqp from 'amqplib';

@Injectable()
export class CourseEventsListener implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(CourseEventsListener.name);
  private connection: amqp.Connection | null = null;
  private channel: amqp.Channel | null = null;
  private readonly queueName = 'course-events';
  private readonly exchangeName = 'lms-events';

  constructor(private httpService: HttpService) {}

  async onModuleInit() {
    try {
      const rabbitmqUrl = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
      // @ts-expect-error - amqplib types have some inconsistencies
      this.connection = await amqp.connect(rabbitmqUrl);
      // @ts-expect-error - amqplib types have some inconsistencies
      this.channel = await this.connection.createChannel();

      await this.channel.assertExchange(this.exchangeName, 'topic', { durable: true });
      await this.channel.assertQueue(this.queueName, { durable: true });

      await this.channel.bindQueue(this.queueName, this.exchangeName, 'course.*');

      this.logger.log('Connected to message broker');

      // Start consuming events
      await this.consumeEvents();
    } catch (error: any) {
      this.logger.warn(
        `Message broker connection failed: ${error?.message || 'Unknown error'}. Service will poll LMS API directly.`
      );
    }
  }

  private async consumeEvents() {
    if (!this.channel) return;

    await this.channel.consume(
      this.queueName,
      async (msg) => {
        if (msg) {
          try {
            const event = JSON.parse(msg.content.toString());
            this.logger.log(`Received event: ${event.eventType} for course ${event.courseId}`);

            // Process the event (e.g., invalidate cache, update similarity index)
            await this.handleCourseEvent(event);

            this.channel?.ack(msg);
          } catch (error: any) {
            this.logger.error(`Error processing event: ${error?.message || 'Unknown error'}`);
            this.channel?.nack(msg, false, false);
          }
        }
      },
      { noAck: false }
    );
  }

  private async handleCourseEvent(event: any) {
    // Handle course created/updated events
    // This allows the similar courses service to react to course changes
    // without directly calling the LMS API
    this.logger.log(`Processing ${event.eventType} event for course ${event.courseId}`);

    // In a real implementation, this might:
    // - Update local cache
    // - Recalculate similarity scores
    // - Invalidate similarity cache for affected courses
  }

  async onModuleDestroy() {
    try {
      if (this.channel) {
        await this.channel.close();
      }
      if (this.connection) {
        // @ts-expect-error - amqplib types have some inconsistencies
        await this.connection.close();
      }
    } catch (error: any) {
      this.logger.error(`Error closing connection: ${error?.message || 'Unknown error'}`);
    }
  }
}
