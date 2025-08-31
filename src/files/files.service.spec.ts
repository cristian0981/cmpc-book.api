import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { FilesService } from './files.service';
import { existsSync } from 'fs';
import { join } from 'path';

// Mock del módulo fs
jest.mock('fs');
const mockExistsSync = existsSync as jest.MockedFunction<typeof existsSync>;

describe('FilesService', () => {
  let service: FilesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FilesService],
    }).compile();

    service = module.get<FilesService>(FilesService);
    
    // Limpiar mocks antes de cada test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getStaticBookImage', () => {
    it('should return the correct path when file exists', () => {
      // Arrange
      const bookName = 'test-book.jpg';
      const expectedPath = join(__dirname, '../../uploads/books', bookName);
      mockExistsSync.mockReturnValue(true);

      // Act
      const result = service.getStaticBookImage(bookName);

      // Assert
      expect(result).toBe(expectedPath);
      expect(mockExistsSync).toHaveBeenCalledWith(expectedPath);
      expect(mockExistsSync).toHaveBeenCalledTimes(1);
    });

    it('should throw BadRequestException when file does not exist', () => {
      // Arrange
      const bookName = 'non-existent-book.jpg';
      const expectedPath = join(__dirname, '../../uploads/books', bookName);
      mockExistsSync.mockReturnValue(false);

      // Act & Assert
      expect(() => service.getStaticBookImage(bookName))
        .toThrow(BadRequestException);
      expect(() => service.getStaticBookImage(bookName))
        .toThrow(`No book found with image ${bookName}`);
      expect(mockExistsSync).toHaveBeenCalledWith(expectedPath);
    });

    it('should handle different file extensions correctly', () => {
      // Arrange
      const testCases = ['book.png', 'book.gif', 'book.jpeg'];
      mockExistsSync.mockReturnValue(true);

      testCases.forEach(bookName => {
        // Act
        const result = service.getStaticBookImage(bookName);
        const expectedPath = join(__dirname, '../../uploads/books', bookName);

        // Assert
        expect(result).toBe(expectedPath);
      });

      expect(mockExistsSync).toHaveBeenCalledTimes(testCases.length);
    });

    it('should handle special characters in filename', () => {
      // Arrange
      const bookName = 'book-with-special-chars_123.jpg';
      const expectedPath = join(__dirname, '../../uploads/books', bookName);
      mockExistsSync.mockReturnValue(true);

      // Act
      const result = service.getStaticBookImage(bookName);

      // Assert
      expect(result).toBe(expectedPath);
      expect(mockExistsSync).toHaveBeenCalledWith(expectedPath);
    });
  });
});
