import { Test, TestingModule } from '@nestjs/testing';
import { CoursesController } from './courses.controller';
import { CoursesService } from './courses.service';

describe('CoursesController', () => {
  let controller: CoursesController;
  let service: CoursesService;

  const mockCoursesService = {
    findSimilar: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CoursesController],
      providers: [
        {
          provide: CoursesService,
          useValue: mockCoursesService,
        },
      ],
    }).compile();

    controller = module.get<CoursesController>(CoursesController);
    service = module.get<CoursesService>(CoursesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return similar courses', async () => {
    const courseId = 'course-1';
    const expectedResult = {
      courseId,
      similarCourses: [{ id: '2', title: 'Similar Course', similarityScore: 80 }],
    };

    mockCoursesService.findSimilar.mockResolvedValue(expectedResult);

    const result = await controller.findSimilar(courseId);
    expect(result).toEqual(expectedResult);
    expect(service.findSimilar).toHaveBeenCalledWith(courseId);
  });
});
