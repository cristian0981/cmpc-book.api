import { Test, TestingModule } from '@nestjs/testing';
import { GenresController } from './genres.controller';
import { GenresService } from './genres.service';
import { CreateGenreDto } from './dto/create-genre.dto';
import { UpdateGenreDto } from './dto/update-genre.dto';

describe('GenresController', () => {
  let controller: GenresController;
  let service: jest.Mocked<GenresService>;

  const mockGenre = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Ficción',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const createGenreDto: CreateGenreDto = {
    name: 'Ficción',
  };

  const updateGenreDto: UpdateGenreDto = {
    name: 'Ciencia Ficción',
  };

  beforeEach(async () => {
    const mockGenresService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      findByName: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [GenresController],
      providers: [
        {
          provide: GenresService,
          useValue: mockGenresService,
        },
      ],
    }).compile();

    controller = module.get<GenresController>(GenresController);
    service = module.get<GenresService>(GenresService) as jest.Mocked<GenresService>;

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a genre', async () => {
      service.create.mockResolvedValue(mockGenre as any);

      const result = await controller.create(createGenreDto);

      expect(service.create).toHaveBeenCalledWith(createGenreDto);
      expect(result).toEqual(mockGenre);
    });
  });

  describe('findAll', () => {
    it('should return all genres', async () => {
      const genres = [mockGenre];
      service.findAll.mockResolvedValue(genres as any);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual(genres);
    });
  });

  describe('findOne', () => {
    it('should return a genre by id', async () => {
      service.findOne.mockResolvedValue(mockGenre as any);

      const result = await controller.findOne('123e4567-e89b-12d3-a456-426614174000');

      expect(service.findOne).toHaveBeenCalledWith('123e4567-e89b-12d3-a456-426614174000');
      expect(result).toEqual(mockGenre);
    });
  });

  describe('update', () => {
    it('should update a genre', async () => {
      const updatedGenre = { ...mockGenre, name: 'Ciencia Ficción' };
      service.update.mockResolvedValue(updatedGenre as any);

      const result = await controller.update('123e4567-e89b-12d3-a456-426614174000', updateGenreDto);

      expect(service.update).toHaveBeenCalledWith('123e4567-e89b-12d3-a456-426614174000', updateGenreDto);
      expect(result).toEqual(updatedGenre);
    });
  });

  describe('remove', () => {
    it('should remove a genre', async () => {
      service.remove.mockResolvedValue(undefined);

      await controller.remove('123e4567-e89b-12d3-a456-426614174000');

      expect(service.remove).toHaveBeenCalledWith('123e4567-e89b-12d3-a456-426614174000');
    });
  });
});
