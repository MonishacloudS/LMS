import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { CourseResponseDto } from './dto/course-response.dto';

@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post()
  create(@Body() createCourseDto: CreateCourseDto): Promise<CourseResponseDto> {
    return this.coursesService.create(createCourseDto);
  }

  @Get()
  findAll(@Query('userId') userId?: string): Promise<CourseResponseDto[]> {
    return this.coursesService.findAll(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Query('userId') userId?: string): Promise<CourseResponseDto> {
    return this.coursesService.findOne(id, userId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCourseDto: UpdateCourseDto
  ): Promise<CourseResponseDto> {
    return this.coursesService.update(id, updateCourseDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.coursesService.remove(id);
  }
}
