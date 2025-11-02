import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Course } from './entities/course.entity';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { CourseResponseDto } from './dto/course-response.dto';
import { CourseQueryDto } from './dto/course-query.dto';
import { PaginatedCoursesResponseDto } from './dto/paginated-courses-response.dto';
import { LessonCompletion } from '../users/entities/lesson-completion.entity';
import { MessageBrokerService } from '../messaging/message-broker.service';

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
    @InjectRepository(LessonCompletion)
    private completionRepository: Repository<LessonCompletion>,
    private messageBroker: MessageBrokerService
  ) {}

  async create(createCourseDto: CreateCourseDto): Promise<CourseResponseDto> {
    const course = this.courseRepository.create(createCourseDto);
    const savedCourse = await this.courseRepository.save(course);

    // Publish async event
    await this.messageBroker.publishCourseCreated(savedCourse.id, {
      title: savedCourse.title,
      category: savedCourse.category,
      tags: savedCourse.tags,
    });

    return this.mapToResponseDto(savedCourse);
  }

  async findAll(query: CourseQueryDto): Promise<PaginatedCoursesResponseDto> {
    const {
      page = 1,
      limit = 10,
      category,
      tags,
      search,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      userId,
    } = query;

    const skip = (page - 1) * limit;

    const where: any = {};

    if (category) {
      where.category = category;
    }

    if (tags && tags.length > 0) {
      // For array columns, we need to check if any tag matches
      // TypeORM doesn't have direct array intersection, so we'll filter in memory
    }

    if (search) {
      where.title = Like(`%${search}%`);
    }

    const order: any = {};
    order[sortBy] = sortOrder;

    const [allCourses, total] = await this.courseRepository.findAndCount({
      where,
      relations: ['lessons'],
      order,
    });

    // Filter by tags if provided (array intersection)
    let filteredCourses = allCourses;
    let filteredTotal = total;

    if (tags && tags.length > 0) {
      filteredCourses = allCourses.filter((course) => {
        if (!course.tags || course.tags.length === 0) return false;
        return tags.some((tag) => course.tags.includes(tag));
      });
      filteredTotal = filteredCourses.length;
    }

    // Apply pagination after filtering
    const paginatedCourses = filteredCourses.slice(skip, skip + limit);

    const courseDtos = userId
      ? await Promise.all(
          paginatedCourses.map((course) => this.mapToResponseDtoWithCompletion(course, userId))
        )
      : paginatedCourses.map((course) => this.mapToResponseDto(course));

    return {
      data: courseDtos,
      total: filteredTotal,
      page,
      limit,
      totalPages: Math.ceil(filteredTotal / limit),
    };
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

    // Publish async event
    await this.messageBroker.publishCourseUpdated(updatedCourse.id, {
      title: updatedCourse.title,
      category: updatedCourse.category,
      tags: updatedCourse.tags,
    });

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
