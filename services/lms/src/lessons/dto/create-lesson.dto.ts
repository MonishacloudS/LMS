import { IsString, IsOptional, IsInt, IsUUID } from 'class-validator';

export class CreateLessonDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsInt()
  orderIndex: number;

  @IsUUID()
  courseId: string;
}
