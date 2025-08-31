import { Test, TestingModule } from '@nestjs/testing';
import { AuthorsController } from './authors.controller';
import { AuthorsService } from './authors.service';

describe('AuthorsController', () => {
  let controller: AuthorsController;
  let service: AuthorsService;

  const mockAuthor = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Test Author',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockAuthorsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthorsController],
      providers: [
        {
          provide: AuthorsService,
          useValue: mockAuthorsService,
        },
      ],
    }).compile();

    controller = module.get<AuthorsController>(AuthorsController);
    service = module.get<AuthorsService>(AuthorsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create an author', async () => {
      const createDto = { name: 'New Author' };
      mockAuthorsService.create.mockResolvedValue(mockAuthor);

      const result = await controller.create(createDto);

      expect(service.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(mockAuthor);
    });
  });

  describe('findAll', () => {
    it('should return all authors', async () => {
      const authors = [mockAuthor];
      mockAuthorsService.findAll.mockResolvedValue(authors);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual(authors);
    });
  });

  describe('findOne', () => {
    it('should return an author by id', async () => {
      mockAuthorsService.findOne.mockResolvedValue(mockAuthor);

      const result = await controller.findOne('123');

      expect(service.findOne).toHaveBeenCalledWith('123');
      expect(result).toEqual(mockAuthor);
    });
  });

  describe('update', () => {
    it('should update an author', async () => {
      const updateDto = { name: 'Updated Author' };
      mockAuthorsService.update.mockResolvedValue(mockAuthor);

      const result = await controller.update('123', updateDto);

      expect(service.update).toHaveBeenCalledWith('123', updateDto);
      expect(result).toEqual(mockAuthor);
    });
  });

  describe('remove', () => {
    it('should remove an author', async () => {
      mockAuthorsService.remove.mockResolvedValue(undefined);

      await controller.remove('123');

      expect(service.remove).toHaveBeenCalledWith('123');
    });
  });
});
