export class SimilarCourseDto {
  id: string;
  title: string;
  description?: string;
  tags?: string[];
  category?: string;
  similarityScore: number;
  createdAt: Date;
  updatedAt: Date;
}

export class SimilarCoursesResponseDto {
  courseId: string;
  similarCourses: SimilarCourseDto[];
}
