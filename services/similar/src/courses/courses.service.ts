import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Course } from './entities/course.entity';
import { SimilarCourseDto, SimilarCoursesResponseDto } from './dto/similar-courses-response.dto';

@Injectable()
export class CoursesService {
  private readonly lmsApiUrl: string;

  constructor(
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
    private httpService: HttpService
  ) {
    this.lmsApiUrl = process.env.LMS_API_URL || 'http://localhost:3001';
  }

  async findSimilar(courseId: string): Promise<SimilarCoursesResponseDto> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.lmsApiUrl}/courses/${courseId}`)
      );
      const targetCourse = response.data;

      if (!targetCourse) {
        throw new NotFoundException(`Course with ID ${courseId} not found`);
      }

      const allCoursesResponse = await firstValueFrom(
        this.httpService.get(`${this.lmsApiUrl}/courses`)
      );
      const allCourses = allCoursesResponse.data;

      const similarCourses = this.calculateSimilarity(targetCourse, allCourses);

      return {
        courseId,
        similarCourses: similarCourses.slice(0, 5),
      };
    } catch (error) {
      if (error.response?.status === 404) {
        throw new NotFoundException(`Course with ID ${courseId} not found`);
      }
      throw error;
    }
  }

  private calculateSimilarity(targetCourse: any, allCourses: any[]): SimilarCourseDto[] {
    const targetTags = new Set(targetCourse.tags || []);
    const targetCategory = targetCourse.category;

    const scoredCourses = allCourses
      .filter((course) => course.id !== targetCourse.id)
      .map((course) => {
        let similarityScore = 0;

        if (course.category && targetCategory && course.category === targetCategory) {
          similarityScore += 50;
        }

        if (course.tags && Array.isArray(course.tags)) {
          const commonTags = course.tags.filter((tag: string) => targetTags.has(tag));
          similarityScore += commonTags.length * 10;
        }

        if (course.description && targetCourse.description) {
          const words1 = new Set(targetCourse.description.toLowerCase().split(/\s+/));
          const words2 = new Set(course.description.toLowerCase().split(/\s+/));
          const commonWords = [...words1].filter((word) => words2.has(word));
          similarityScore += Math.min(commonWords.length * 2, 30);
        }

        return {
          ...course,
          similarityScore: Math.min(similarityScore, 100),
        };
      })
      .filter((course) => course.similarityScore > 0)
      .sort((a, b) => b.similarityScore - a.similarityScore);

    return scoredCourses;
  }
}
