import { Test, TestingModule } from '@nestjs/testing';
import { CoursesController } from './courses.controller';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';

describe('CoursesController', () => {
  let controller: CoursesController;
  let service: CoursesService;

  const mockCoursesService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
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

  it('should create a course', async () => {
    const createCourseDto: CreateCourseDto = {
      title: 'Test Course',
      description: 'Test Description',
    };
    const expectedResult = { id: '1', ...createCourseDto };

    mockCoursesService.create.mockResolvedValue(expectedResult);

    const result = await controller.create(createCourseDto);
    expect(result).toEqual(expectedResult);
    expect(service.create).toHaveBeenCalledWith(createCourseDto);
  });

  it('should return an array of courses', async () => {
    const query = {};
    const expectedResult = {
      data: [{ id: '1', title: 'Test Course' }],
      total: 1,
      page: 1,
      limit: 10,
      totalPages: 1,
    };
    mockCoursesService.findAll.mockResolvedValue(expectedResult);

    const result = await controller.findAll(query);
    expect(result).toEqual(expectedResult);
    expect(service.findAll).toHaveBeenCalledWith(query);
  });
});
