import { LessonResponseDto } from '../../lessons/dto/lesson-response.dto';

export class CourseResponseDto {
  id: string;
  title: string;
  description?: string;
  tags?: string[];
  category?: string;
  completionPercentage: number;
  lessons?: LessonResponseDto[];
  createdAt: Date;
  updatedAt: Date;
}
