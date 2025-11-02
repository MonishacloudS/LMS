import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { CourseResponseDto } from './dto/course-response.dto';
import { CourseQueryDto } from './dto/course-query.dto';
import { PaginatedCoursesResponseDto } from './dto/paginated-courses-response.dto';
import { Public } from '../auth/decorators/public.decorator';

@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Public()
  @Post()
  create(@Body() createCourseDto: CreateCourseDto): Promise<CourseResponseDto> {
    return this.coursesService.create(createCourseDto);
  }

  @Public()
  @Get()
  findAll(@Query() query: CourseQueryDto): Promise<PaginatedCoursesResponseDto> {
    return this.coursesService.findAll(query);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string, @Query('userId') userId?: string): Promise<CourseResponseDto> {
    return this.coursesService.findOne(id, userId);
  }

  @Public()
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCourseDto: UpdateCourseDto
  ): Promise<CourseResponseDto> {
    return this.coursesService.update(id, updateCourseDto);
  }

  @Public()
  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.coursesService.remove(id);
  }
}
