export class LessonResponseDto {
  id: string;
  title: string;
  content?: string;
  orderIndex: number;
  courseId: string;
  createdAt: Date;
  updatedAt: Date;
}
