import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from './entities/course.entity';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { CourseResponseDto } from './dto/course-response.dto';
import { LessonCompletion } from '../users/entities/lesson-completion.entity';

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
    @InjectRepository(LessonCompletion)
    private completionRepository: Repository<LessonCompletion>
  ) {}

  async create(createCourseDto: CreateCourseDto): Promise<CourseResponseDto> {
    const course = this.courseRepository.create(createCourseDto);
    const savedCourse = await this.courseRepository.save(course);
    return this.mapToResponseDto(savedCourse);
  }

  async findAll(userId?: string): Promise<CourseResponseDto[]> {
    const courses = await this.courseRepository.find({
      relations: ['lessons'],
      order: { createdAt: 'DESC' },
    });

    if (userId) {
      return Promise.all(
        courses.map((course) => this.mapToResponseDtoWithCompletion(course, userId))
      );
    }

    return courses.map((course) => this.mapToResponseDto(course));
  }

  async findOne(id: string, userId?: string): Promise<CourseResponseDto> {
    const course = await this.courseRepository.findOne({
      where: { id },
      relations: ['lessons'],
    });

    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }

    if (userId) {
      return this.mapToResponseDtoWithCompletion(course, userId);
    }

    const result = this.mapToResponseDto(course);
    return result;
  }

  async update(id: string, updateCourseDto: UpdateCourseDto): Promise<CourseResponseDto> {
    const course = await this.courseRepository.findOne({ where: { id } });
    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }
    Object.assign(course, updateCourseDto);
    const updatedCourse = await this.courseRepository.save(course);
    return this.mapToResponseDto(updatedCourse);
  }

  async remove(id: string): Promise<void> {
    const course = await this.courseRepository.findOne({ where: { id } });
    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }
    await this.courseRepository.remove(course);
  }

  private async calculateCompletionPercentage(courseId: string, userId: string): Promise<number> {
    const course = await this.courseRepository.findOne({
      where: { id: courseId },
      relations: ['lessons'],
    });

    if (!course || !course.lessons || course.lessons.length === 0) {
      return 0;
    }

    const completedLessons = await this.completionRepository.count({
      where: {
        userId,
        lesson: { courseId },
      },
    });

    return Math.round((completedLessons / course.lessons.length) * 100);
  }

  private mapToResponseDto(course: Course): CourseResponseDto {
    return {
      id: course.id,
      title: course.title,
      description: course.description,
      tags: course.tags,
      category: course.category,
      completionPercentage: 0,
      lessons: course.lessons?.map((lesson) => ({
        id: lesson.id,
        title: lesson.title,
        content: lesson.content,
        orderIndex: lesson.orderIndex,
        courseId: lesson.courseId,
        createdAt: lesson.createdAt,
        updatedAt: lesson.updatedAt,
      })),
      createdAt: course.createdAt,
      updatedAt: course.updatedAt,
    };
  }

  private async mapToResponseDtoWithCompletion(
    course: Course,
    userId: string
  ): Promise<CourseResponseDto> {
    const completionPercentage = await this.calculateCompletionPercentage(course.id, userId);
    return {
      ...this.mapToResponseDto(course),
      completionPercentage,
    };
  }
}
