import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { Response } from 'express';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';

describe('FilesController', () => {
  let controller: FilesController;
  let filesService: FilesService;
  let mockResponse: Partial<Response>;

  beforeEach(async () => {
    const mockFilesService = {
      getStaticBookImage: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [FilesController],
      providers: [
        {
          provide: FilesService,
          useValue: mockFilesService,
        },
      ],
    }).compile();

    controller = module.get<FilesController>(FilesController);
    filesService = module.get<FilesService>(FilesService);

    // Mock del objeto Response
    mockResponse = {
      sendFile: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findBookImage', () => {
    it('should return image file when book exists', () => {
      // Arrange
      const bookName = 'test-book.jpg';
      const mockPath = '/path/to/uploads/books/test-book.jpg';
      (filesService.getStaticBookImage as jest.Mock).mockReturnValue(mockPath);

      // Act
      controller.findBookImage(mockResponse as Response, bookName);

      // Assert
      expect(filesService.getStaticBookImage).toHaveBeenCalledWith(bookName);
      expect(filesService.getStaticBookImage).toHaveBeenCalledTimes(1);
      expect(mockResponse.sendFile).toHaveBeenCalledWith(mockPath);
    });

    it('should handle service exceptions', () => {
      // Arrange
      const bookName = 'non-existent-book.jpg';
      const errorMessage = `No book found with image ${bookName}`;
      (filesService.getStaticBookImage as jest.Mock)
        .mockImplementation(() => {
          throw new BadRequestException(errorMessage);
        });

      // Act & Assert
      expect(() => controller.findBookImage(mockResponse as Response, bookName))
        .toThrow(BadRequestException);
      expect(() => controller.findBookImage(mockResponse as Response, bookName))
        .toThrow(errorMessage);
      expect(filesService.getStaticBookImage).toHaveBeenCalledWith(bookName);
      expect(mockResponse.sendFile).not.toHaveBeenCalled();
    });

    it('should handle different image formats', () => {
      // Arrange
      const testCases = [
        { bookName: 'book.jpg', path: '/path/to/book.jpg' },
        { bookName: 'book.png', path: '/path/to/book.png' },
        { bookName: 'book.gif', path: '/path/to/book.gif' },
      ];

      testCases.forEach(({ bookName, path }) => {
        (filesService.getStaticBookImage as jest.Mock).mockReturnValue(path);

        // Act
        controller.findBookImage(mockResponse as Response, bookName);

        // Assert
        expect(filesService.getStaticBookImage).toHaveBeenCalledWith(bookName);
        expect(mockResponse.sendFile).toHaveBeenCalledWith(path);
      });

      expect(filesService.getStaticBookImage).toHaveBeenCalledTimes(testCases.length);
    });
  });

  describe('uploadBookImage', () => {
    it('should return secure URL when file is uploaded successfully', () => {
      // Arrange
      const mockFile: Express.Multer.File = {
        fieldname: 'file',
        originalname: 'test-image.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        size: 1024,
        destination: './uploads/books',
        filename: 'unique-filename.jpg',
        path: './uploads/books/unique-filename.jpg',
        buffer: Buffer.from(''),
        stream: null,
      };

      // Act
      const result = controller.uploadBookImage(mockFile);

      // Assert
      expect(result).toEqual({
        secureUrl: `${process.env.HOST_API || 'http://localhost:3000'}/files/books/${mockFile.filename}`
      });
    });

    it('should throw BadRequestException when no file is provided', () => {
      // Act & Assert
      expect(() => controller.uploadBookImage(undefined))
        .toThrow('La extension del archivo no es válida');
    });

    it('should handle different image types', () => {
      // Arrange
      const imageTypes = [
        { mimetype: 'image/jpeg', filename: 'test.jpg' },
        { mimetype: 'image/png', filename: 'test.png' },
        { mimetype: 'image/gif', filename: 'test.gif' },
      ];

      imageTypes.forEach(({ mimetype, filename }) => {
        const mockFile: Express.Multer.File = {
          fieldname: 'file',
          originalname: filename,
          encoding: '7bit',
          mimetype,
          size: 1024,
          destination: './uploads/books',
          filename,
          path: `./uploads/books/${filename}`,
          buffer: Buffer.from(''),
          stream: null,
        };

        // Act
        const result = controller.uploadBookImage(mockFile);

        // Assert
        expect(result.secureUrl).toContain(filename);
      });
    });
  });
});
