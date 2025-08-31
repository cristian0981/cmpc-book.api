import { Test, TestingModule } from '@nestjs/testing';
import { EditorialsController } from './editorials.controller';
import { EditorialsService } from './editorials.service';

describe('EditorialsController', () => {
  let controller: EditorialsController;
  let service: EditorialsService;

  const mockEditorial = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Test Editorial',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockEditorialsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EditorialsController],
      providers: [
        {
          provide: EditorialsService,
          useValue: mockEditorialsService,
        },
      ],
    }).compile();

    controller = module.get<EditorialsController>(EditorialsController);
    service = module.get<EditorialsService>(EditorialsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create an editorial', async () => {
      const createDto = { name: 'New Editorial' };
      mockEditorialsService.create.mockResolvedValue(mockEditorial);

      const result = await controller.create(createDto);

      expect(service.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(mockEditorial);
    });
  });

  describe('findAll', () => {
    it('should return all editorials', async () => {
      const editorials = [mockEditorial];
      mockEditorialsService.findAll.mockResolvedValue(editorials);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual(editorials);
    });
  });

  describe('findOne', () => {
    it('should return an editorial by id', async () => {
      mockEditorialsService.findOne.mockResolvedValue(mockEditorial);

      const result = await controller.findOne('123');

      expect(service.findOne).toHaveBeenCalledWith('123');
      expect(result).toEqual(mockEditorial);
    });
  });

  describe('update', () => {
    it('should update an editorial', async () => {
      const updateDto = { name: 'Updated Editorial' };
      mockEditorialsService.update.mockResolvedValue(mockEditorial);

      const result = await controller.update('123', updateDto);

      expect(service.update).toHaveBeenCalledWith('123', updateDto);
      expect(result).toEqual(mockEditorial);
    });
  });

  describe('remove', () => {
    it('should remove an editorial', async () => {
      mockEditorialsService.remove.mockResolvedValue(undefined);

      await controller.remove('123');

      expect(service.remove).toHaveBeenCalledWith('123');
    });
  });
});
