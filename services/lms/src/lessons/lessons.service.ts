import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lesson } from './entities/lesson.entity';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { LessonResponseDto } from './dto/lesson-response.dto';

@Injectable()
export class LessonsService {
  constructor(
    @InjectRepository(Lesson)
    private lessonRepository: Repository<Lesson>
  ) {}

  async create(createLessonDto: CreateLessonDto): Promise<LessonResponseDto> {
    const lesson = this.lessonRepository.create(createLessonDto);
    const savedLesson = await this.lessonRepository.save(lesson);
    return this.mapToResponseDto(savedLesson);
  }

  async findAll(courseId?: string): Promise<LessonResponseDto[]> {
    const where = courseId ? { courseId } : {};
    const lessons = await this.lessonRepository.find({
      where,
      order: { orderIndex: 'ASC' },
    });
    return lessons.map((lesson) => this.mapToResponseDto(lesson));
  }

  async findOne(id: string): Promise<LessonResponseDto> {
    const lesson = await this.lessonRepository.findOne({ where: { id } });
    if (!lesson) {
      throw new NotFoundException(`Lesson with ID ${id} not found`);
    }
    return this.mapToResponseDto(lesson);
  }

  async update(id: string, updateLessonDto: UpdateLessonDto): Promise<LessonResponseDto> {
    const lessonEntity = await this.lessonRepository.findOne({ where: { id } });
    if (!lessonEntity) {
      throw new NotFoundException(`Lesson with ID ${id} not found`);
    }
    Object.assign(lessonEntity, updateLessonDto);
    const updatedLesson = await this.lessonRepository.save(lessonEntity);
    return this.mapToResponseDto(updatedLesson);
  }

  async remove(id: string): Promise<void> {
    const lessonEntity = await this.lessonRepository.findOne({ where: { id } });
    if (!lessonEntity) {
      throw new NotFoundException(`Lesson with ID ${id} not found`);
    }
    await this.lessonRepository.remove(lessonEntity);
  }

  private mapToResponseDto(lesson: Lesson): LessonResponseDto {
    return {
      id: lesson.id,
      title: lesson.title,
      content: lesson.content,
      orderIndex: lesson.orderIndex,
      courseId: lesson.courseId,
      createdAt: lesson.createdAt,
      updatedAt: lesson.updatedAt,
    };
  }
}
