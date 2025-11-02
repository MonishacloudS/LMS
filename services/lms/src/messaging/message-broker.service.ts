import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import * as amqp from 'amqplib';

@Injectable()
export class MessageBrokerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MessageBrokerService.name);
  private connection: amqp.Connection | null = null;
  private channel: amqp.Channel | null = null;
  private readonly queueName = 'course-events';
  private readonly exchangeName = 'lms-events';

  async onModuleInit() {
    try {
      const rabbitmqUrl = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
      this.connection = await amqp.connect(rabbitmqUrl);
      this.channel = await this.connection.createChannel();
      
      await this.channel.assertExchange(this.exchangeName, 'topic', { durable: true });
      await this.channel.assertQueue(this.queueName, { durable: true });
      
      await this.channel.bindQueue(this.queueName, this.exchangeName, 'course.*');
      
      this.logger.log('Connected to message broker');
    } catch (error) {
      this.logger.warn(`Message broker connection failed: ${error.message}. Running in fallback mode.`);
    }
  }

  async onModuleDestroy() {
    if (this.channel) {
      await this.channel.close();
    }
    if (this.connection) {
      await this.connection.close();
    }
  }

  async publishCourseCreated(courseId: string, data: any) {
    if (!this.channel) {
      this.logger.warn('Message broker not available, skipping event');
      return;
    }

    try {
      const message = JSON.stringify({
        eventType: 'course.created',
        courseId,
        data,
        timestamp: new Date().toISOString(),
      });

      this.channel.publish(this.exchangeName, 'course.created', Buffer.from(message), {
        persistent: true,
      });

      this.logger.log(`Published course.created event for course ${courseId}`);
    } catch (error) {
      this.logger.error(`Failed to publish event: ${error.message}`);
    }
  }

  async publishCourseUpdated(courseId: string, data: any) {
    if (!this.channel) {
      this.logger.warn('Message broker not available, skipping event');
      return;
    }

    try {
      const message = JSON.stringify({
        eventType: 'course.updated',
        courseId,
        data,
        timestamp: new Date().toISOString(),
      });

      this.channel.publish(this.exchangeName, 'course.updated', Buffer.from(message), {
        persistent: true,
      });

      this.logger.log(`Published course.updated event for course ${courseId}`);
    } catch (error) {
      this.logger.error(`Failed to publish event: ${error.message}`);
    }
  }

  async consumeCourseEvents(callback: (message: any) => Promise<void>) {
    if (!this.channel) {
      this.logger.warn('Message broker not available, cannot consume events');
      return;
    }

    await this.channel.consume(
      this.queueName,
      async (msg) => {
        if (msg) {
          try {
            const content = JSON.parse(msg.content.toString());
            await callback(content);
            this.channel?.ack(msg);
          } catch (error) {
            this.logger.error(`Error processing message: ${error.message}`);
            this.channel?.nack(msg, false, false);
          }
        }
      },
      { noAck: false }
    );
  }
}

