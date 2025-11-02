import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { LessonsService } from './lessons.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { LessonResponseDto } from './dto/lesson-response.dto';
import { UsersService } from '../users/users.service';
import { Public } from '../auth/decorators/public.decorator';

@Controller('lessons')
export class LessonsController {
  constructor(
    private readonly lessonsService: LessonsService,
    private readonly usersService: UsersService
  ) {}

  @Public()
  @Post()
  create(@Body() createLessonDto: CreateLessonDto): Promise<LessonResponseDto> {
    return this.lessonsService.create(createLessonDto);
  }

  @Public()
  @Get()
  findAll(@Query('courseId') courseId?: string): Promise<LessonResponseDto[]> {
    return this.lessonsService.findAll(courseId);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string): Promise<LessonResponseDto> {
    return this.lessonsService.findOne(id);
  }

  @Public()
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateLessonDto: UpdateLessonDto
  ): Promise<LessonResponseDto> {
    return this.lessonsService.update(id, updateLessonDto);
  }

  @Public()
  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.lessonsService.remove(id);
  }

  @Public()
  @Post(':id/complete')
  async completeLesson(
    @Param('id') id: string,
    @Query('userId') userId?: string
  ): Promise<{ message: string }> {
    const userIdToUse = userId || 'default-user-id';
    await this.usersService.completeLesson(userIdToUse, id);
    return { message: 'Lesson marked as completed' };
  }
}
