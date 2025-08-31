import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { EditorialsService } from './editorials.service';
import { Editorial } from './models/editorial.model';

describe('EditorialsService', () => {
  let service: EditorialsService;
  let mockEditorialModel: any;

  const mockEditorial = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Test Editorial',
    createdAt: new Date(),
    updatedAt: new Date(),
    update: jest.fn(),
    destroy: jest.fn(),
  };

  beforeEach(async () => {
    mockEditorialModel = {
      create: jest.fn(),
      findAll: jest.fn(),
      findByPk: jest.fn(),
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EditorialsService,
        {
          provide: getModelToken(Editorial),
          useValue: mockEditorialModel,
        },
      ],
    }).compile();

    service = module.get<EditorialsService>(EditorialsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new editorial', async () => {
      const createDto = { name: 'New Editorial' };
      mockEditorialModel.findOne.mockResolvedValue(null);
      mockEditorialModel.create.mockResolvedValue(mockEditorial);

      const result = await service.create(createDto);

      expect(mockEditorialModel.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(mockEditorial);
    });

    it('should throw ConflictException if editorial already exists', async () => {
      const createDto = { name: 'Existing Editorial' };
      mockEditorialModel.findOne.mockResolvedValue(mockEditorial);

      await expect(service.create(createDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('should return all editorials', async () => {
      const editorials = [mockEditorial];
      mockEditorialModel.findAll.mockResolvedValue(editorials);

      const result = await service.findAll();

      expect(mockEditorialModel.findAll).toHaveBeenCalledWith({
        order: [['name', 'ASC']],
      });
      expect(result).toEqual(editorials);
    });
  });

  describe('findOne', () => {
    it('should return an editorial by id', async () => {
      mockEditorialModel.findByPk.mockResolvedValue(mockEditorial);

      const result = await service.findOne('123');

      expect(mockEditorialModel.findByPk).toHaveBeenCalledWith('123');
      expect(result).toEqual(mockEditorial);
    });

    it('should throw NotFoundException if editorial not found', async () => {
      mockEditorialModel.findByPk.mockResolvedValue(null);

      await expect(service.findOne('123')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update an editorial', async () => {
      const updateDto = { name: 'Updated Editorial' };
      mockEditorialModel.findByPk.mockResolvedValue(mockEditorial);
      mockEditorialModel.findOne.mockResolvedValue(null);
      mockEditorial.update.mockResolvedValue(mockEditorial);

      const result = await service.update('123', updateDto);

      expect(mockEditorial.update).toHaveBeenCalledWith(updateDto);
      expect(result).toEqual(mockEditorial);
    });
  });

  describe('remove', () => {
    it('should remove an editorial', async () => {
      mockEditorialModel.findByPk.mockResolvedValue(mockEditorial);
      mockEditorial.destroy.mockResolvedValue(undefined);

      await service.remove('123');

      expect(mockEditorial.destroy).toHaveBeenCalled();
    });
  });
});
