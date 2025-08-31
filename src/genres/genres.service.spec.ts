import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { GenresService } from './genres.service';
import { Genre } from './models/genre.model';

describe('GenresService', () => {
  let service: GenresService;
  let mockGenreModel: any;

  const mockGenre = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Test Genre',
    createdAt: new Date(),
    updatedAt: new Date(),
    update: jest.fn(),
    destroy: jest.fn(),
  };

  beforeEach(async () => {
    mockGenreModel = {
      create: jest.fn(),
      findAll: jest.fn(),
      findByPk: jest.fn(),
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GenresService,
        {
          provide: getModelToken(Genre),
          useValue: mockGenreModel,
        },
      ],
    }).compile();

    service = module.get<GenresService>(GenresService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new genre', async () => {
      const createDto = { name: 'New Genre' };
      mockGenreModel.create.mockResolvedValue(mockGenre);

      const result = await service.create(createDto);

      expect(mockGenreModel.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(mockGenre);
    });
  });

  describe('findAll', () => {
    it('should return all genres', async () => {
      const genres = [mockGenre];
      mockGenreModel.findAll.mockResolvedValue(genres);

      const result = await service.findAll();

      expect(mockGenreModel.findAll).toHaveBeenCalledWith({
        order: [['name', 'ASC']],
      });
      expect(result).toEqual(genres);
    });
  });

  describe('findOne', () => {
    it('should return a genre by id', async () => {
      mockGenreModel.findByPk.mockResolvedValue(mockGenre);

      const result = await service.findOne('123');

      expect(mockGenreModel.findByPk).toHaveBeenCalledWith('123');
      expect(result).toEqual(mockGenre);
    });

    it('should throw NotFoundException if genre not found', async () => {
      mockGenreModel.findByPk.mockResolvedValue(null);

      await expect(service.findOne('123')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a genre', async () => {
      const updateDto = { name: 'Updated Genre' };
      mockGenreModel.findByPk.mockResolvedValue(mockGenre);
      mockGenre.update.mockResolvedValue(mockGenre);

      const result = await service.update('123', updateDto);

      expect(mockGenre.update).toHaveBeenCalledWith(updateDto);
      expect(result).toEqual(mockGenre);
    });
  });

  describe('remove', () => {
    it('should remove a genre', async () => {
      mockGenreModel.findByPk.mockResolvedValue(mockGenre);
      mockGenre.destroy.mockResolvedValue(undefined);

      await service.remove('123');

      expect(mockGenre.destroy).toHaveBeenCalled();
    });
  });

  describe('findByName', () => {
    it('should return a genre by name', async () => {
      mockGenreModel.findOne.mockResolvedValue(mockGenre);

      const result = await service.findByName('Test Genre');

      expect(mockGenreModel.findOne).toHaveBeenCalledWith({
        where: { name: 'Test Genre' },
      });
      expect(result).toEqual(mockGenre);
    });

    it('should return null when genre not found', async () => {
      mockGenreModel.findOne.mockResolvedValue(null);

      const result = await service.findByName('Non-existent Genre');

      expect(result).toBeNull();
    });
  });
});
