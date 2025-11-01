import { Controller, Get, Param } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserStatsResponseDto } from './dto/user-stats-response.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':id/stats')
  getStats(@Param('id') id: string): Promise<UserStatsResponseDto> {
    return this.usersService.getStats(id);
  }
}
