import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoursesModule } from './courses/courses.module';
import { DatabaseConfigService } from './config/database-config.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    HttpModule,
    TypeOrmModule.forRootAsync({
      useClass: DatabaseConfigService,
    }),
    CoursesModule,
  ],
})
export class AppModule {}
