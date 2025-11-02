import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';
import { CourseEventsListener } from './course-events.listener';
import { Course } from './entities/course.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Course]), HttpModule],
  controllers: [CoursesController],
  providers: [CoursesService, CourseEventsListener],
})
export class CoursesModule {}
