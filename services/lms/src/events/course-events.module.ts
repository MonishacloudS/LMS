import { Module } from '@nestjs/common';
import { CourseEventsService } from './course-events.service';
import { CourseEventsController } from './course-events.controller';

@Module({
  providers: [CourseEventsService],
  controllers: [CourseEventsController],
  exports: [CourseEventsService],
})
export class CourseEventsModule {}

