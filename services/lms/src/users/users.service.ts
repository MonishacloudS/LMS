import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LessonCompletion } from './entities/lesson-completion.entity';
import { User } from './entities/user.entity';
import { UserStatsResponseDto } from './dto/user-stats-response.dto';
import { Lesson } from '../lessons/entities/lesson.entity';
import { Course } from '../courses/entities/course.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(LessonCompletion)
    private completionRepository: Repository<LessonCompletion>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Lesson)
    private lessonRepository: Repository<Lesson>,
    @InjectRepository(Course)
    private courseRepository: Repository<Course>
  ) {}

  async completeLesson(userId: string, lessonId: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const lesson = await this.lessonRepository.findOne({ where: { id: lessonId } });
    if (!lesson) {
      throw new NotFoundException(`Lesson with ID ${lessonId} not found`);
    }

    const existingCompletion = await this.completionRepository.findOne({
      where: { userId, lessonId },
    });

    if (!existingCompletion) {
      const completion = this.completionRepository.create({
        userId,
        lessonId,
      });
      await this.completionRepository.save(completion);
    }
  }

  async getStats(userId: string): Promise<UserStatsResponseDto> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const totalCourses = await this.courseRepository.count();
    const totalLessons = await this.lessonRepository.count();
    const completedLessons = await this.completionRepository.count({
      where: { userId },
    });

    const completionPercentage =
      totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    const userCompletedLessons = await this.completionRepository.find({
      where: { userId },
      relations: ['lesson'],
    });

    const completedCourseIds = new Set(
      userCompletedLessons.map((completion) => completion.lesson.courseId)
    );

    const allCourses = await this.courseRepository.find({ relations: ['lessons'] });
    const coursesInProgress = allCourses.filter((course) => {
      if (!course.lessons || course.lessons.length === 0) return false;
      const hasCompletedLessons = completedCourseIds.has(course.id);
      const courseCompletedLessons = userCompletedLessons.filter(
        (completion) => completion.lesson.courseId === course.id
      ).length;
      return hasCompletedLessons && courseCompletedLessons < course.lessons.length;
    }).length;

    return {
      totalCourses,
      totalLessons,
      completedLessons,
      completionPercentage,
      coursesInProgress,
    };
  }
}
