import { Injectable, OnModuleInit } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

export interface CourseCreatedEvent {
  courseId: string;
  title: string;
  category?: string;
  tags?: string[];
  timestamp: Date;
}

export interface CourseUpdatedEvent {
  courseId: string;
  title?: string;
  category?: string;
  tags?: string[];
  timestamp: Date;
}

@Injectable()
export class CourseEventsService implements OnModuleInit {
  private eventEmitter: EventEmitter2;

  constructor() {
    this.eventEmitter = new EventEmitter2();
  }

  onModuleInit() {
    // Event emitter is ready
  }

  emitCourseCreated(event: CourseCreatedEvent) {
    this.eventEmitter.emit('course.created', event);
  }

  emitCourseUpdated(event: CourseUpdatedEvent) {
    this.eventEmitter.emit('course.updated', event);
  }

  onCourseCreated(callback: (event: CourseCreatedEvent) => void) {
    this.eventEmitter.on('course.created', callback);
  }

  onCourseUpdated(callback: (event: CourseUpdatedEvent) => void) {
    this.eventEmitter.on('course.updated', callback);
  }
}
