import { Test, TestingModule } from '@nestjs/testing';
import { LessonsController } from './lessons.controller';
import { LessonsService } from './lessons.service';
import { UsersService } from '../users/users.service';

describe('LessonsController', () => {
  let controller: LessonsController;
  let service: LessonsService;

  const mockLessonsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockUsersService = {
    completeLesson: jest.fn(),
    getStats: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LessonsController],
      providers: [
        {
          provide: LessonsService,
          useValue: mockLessonsService,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<LessonsController>(LessonsController);
    service = module.get<LessonsService>(LessonsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should complete a lesson', async () => {
    const lessonId = 'lesson-1';
    const userId = 'user-1';

    mockUsersService.completeLesson.mockResolvedValue(undefined);

    const result = await controller.completeLesson(lessonId, userId);
    expect(result).toEqual({ message: 'Lesson marked as completed' });
    expect(mockUsersService.completeLesson).toHaveBeenCalledWith(userId, lessonId);
  });
});
