import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { AuthorsService } from './authors.service';
import { Author } from './models/author.model';

describe('AuthorsService', () => {
  let service: AuthorsService;
  let mockAuthorModel: any;

  const mockAuthor = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Test Author',
    createdAt: new Date(),
    updatedAt: new Date(),
    update: jest.fn(),
    destroy: jest.fn(),
  };

  beforeEach(async () => {
    mockAuthorModel = {
      create: jest.fn(),
      findAll: jest.fn(),
      findByPk: jest.fn(),
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthorsService,
        {
          provide: getModelToken(Author),
          useValue: mockAuthorModel,
        },
      ],
    }).compile();

    service = module.get<AuthorsService>(AuthorsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new author', async () => {
      const createDto = { name: 'New Author' };
      mockAuthorModel.findOne.mockResolvedValue(null);
      mockAuthorModel.create.mockResolvedValue(mockAuthor);

      const result = await service.create(createDto);

      expect(mockAuthorModel.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(mockAuthor);
    });

    it('should throw ConflictException if author already exists', async () => {
      const createDto = { name: 'Existing Author' };
      mockAuthorModel.findOne.mockResolvedValue(mockAuthor);

      await expect(service.create(createDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('should return all authors', async () => {
      const authors = [mockAuthor];
      mockAuthorModel.findAll.mockResolvedValue(authors);

      const result = await service.findAll();

      expect(mockAuthorModel.findAll).toHaveBeenCalledWith({
        order: [['name', 'ASC']],
      });
      expect(result).toEqual(authors);
    });
  });

  describe('findOne', () => {
    it('should return an author by id', async () => {
      mockAuthorModel.findByPk.mockResolvedValue(mockAuthor);

      const result = await service.findOne('123');

      expect(mockAuthorModel.findByPk).toHaveBeenCalledWith('123');
      expect(result).toEqual(mockAuthor);
    });

    it('should throw NotFoundException if author not found', async () => {
      mockAuthorModel.findByPk.mockResolvedValue(null);

      await expect(service.findOne('123')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update an author', async () => {
      const updateDto = { name: 'Updated Author' };
      mockAuthorModel.findByPk.mockResolvedValue(mockAuthor);
      mockAuthorModel.findOne.mockResolvedValue(null);
      mockAuthor.update.mockResolvedValue(mockAuthor);

      const result = await service.update('123', updateDto);

      expect(mockAuthor.update).toHaveBeenCalledWith(updateDto);
      expect(result).toEqual(mockAuthor);
    });
  });

  describe('remove', () => {
    it('should remove an author', async () => {
      mockAuthorModel.findByPk.mockResolvedValue(mockAuthor);
      mockAuthor.destroy.mockResolvedValue(undefined);

      await service.remove('123');

      expect(mockAuthor.destroy).toHaveBeenCalled();
    });
  });
});
