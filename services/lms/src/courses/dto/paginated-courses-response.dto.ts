import { CourseResponseDto } from './course-response.dto';

export class PaginatedCoursesResponseDto {
  data: CourseResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
