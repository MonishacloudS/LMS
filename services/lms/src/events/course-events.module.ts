import { Module } from '@nestjs/common';
import { CourseEventsService } from './course-events.service';

@Module({
  providers: [CourseEventsService],
  exports: [CourseEventsService],
})
export class CourseEventsModule {}
