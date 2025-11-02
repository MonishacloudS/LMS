import { Controller, Get, Param, Post, Body } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserStatsResponseDto } from './dto/user-stats-response.dto';
import { Public } from '../auth/decorators/public.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { AuthModule } from '../auth/auth.module';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Public()
  @Post('login')
  async login(@Body() body: { userId: string }) {
    // This endpoint allows login with just userId for demonstration
    // In production, this would validate credentials
    return { message: 'Login endpoint - use /auth/login for JWT token' };
  }

  @Get(':id/stats')
  getStats(@Param('id') id: string, @GetUser() user: any): Promise<UserStatsResponseDto> {
    // Use authenticated user ID or provided ID
    const userId = user?.userId || id;
    return this.usersService.getStats(userId);
  }
}
