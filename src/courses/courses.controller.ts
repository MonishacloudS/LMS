import { Controller, Get, Param } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { SimilarCoursesResponseDto } from './dto/similar-courses-response.dto';

@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get(':id/similar')
  findSimilar(@Param('id') id: string): Promise<SimilarCoursesResponseDto> {
    return this.coursesService.findSimilar(id);
  }
}
