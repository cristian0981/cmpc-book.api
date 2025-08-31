import { fileFilter } from './fileFilter.helper';
import { fileNamer } from './fileNamer.helper';
import { v4 as uuid } from 'uuid';

// Mock uuid
jest.mock('uuid');
const mockUuid = uuid as jest.MockedFunction<typeof uuid>;

describe('File Helpers', () => {
  let mockRequest: Express.Request;
  let mockCallback: jest.Mock;

  beforeEach(() => {
    mockRequest = {} as Express.Request;
    mockCallback = jest.fn();
    jest.clearAllMocks();
  });

  describe('fileFilter', () => {
    it('should accept valid image files', () => {
      const validMimeTypes = [
        'image/jpg',
        'image/jpeg', 
        'image/png',
        'image/gif'
      ];

      validMimeTypes.forEach(mimetype => {
        const mockFile: Express.Multer.File = {
          mimetype,
        } as Express.Multer.File;

        fileFilter(mockRequest, mockFile, mockCallback);

        expect(mockCallback).toHaveBeenCalledWith(null, true);
        mockCallback.mockClear();
      });
    });

    it('should reject invalid file types', () => {
      const invalidMimeTypes = [
        'application/pdf',
        'text/plain',
        'video/mp4',
        'audio/mp3',
        'image/bmp',
        'image/svg+xml'
      ];

      invalidMimeTypes.forEach(mimetype => {
        const mockFile: Express.Multer.File = {
          mimetype,
        } as Express.Multer.File;

        fileFilter(mockRequest, mockFile, mockCallback);

        expect(mockCallback).toHaveBeenCalledWith(null, false);
        mockCallback.mockClear();
      });
    });

    it('should handle empty file', () => {
      fileFilter(mockRequest, null, mockCallback);

      expect(mockCallback).toHaveBeenCalledWith(
        new Error('File is empty'), 
        false
      );
    });

    it('should handle undefined file', () => {
      fileFilter(mockRequest, undefined, mockCallback);

      expect(mockCallback).toHaveBeenCalledWith(
        new Error('File is empty'), 
        false
      );
    });
  });

  describe('fileNamer', () => {
    it('should generate unique filename with correct extension', () => {
      // Arrange
      const mockUuidValue = 'test-uuid-123';
      mockUuid.mockReturnValue(mockUuidValue);
      
      const mockFile: Express.Multer.File = {
        mimetype: 'image/jpeg',
      } as Express.Multer.File;

      // Act
      fileNamer(mockRequest, mockFile, mockCallback);

      // Assert
      expect(mockUuid).toHaveBeenCalledTimes(1);
      expect(mockCallback).toHaveBeenCalledWith(null, `${mockUuidValue}.jpeg`);
    });

    it('should handle different image extensions', () => {
      const testCases = [
        { mimetype: 'image/jpg', expectedExt: 'jpg' },
        { mimetype: 'image/jpeg', expectedExt: 'jpeg' },
        { mimetype: 'image/png', expectedExt: 'png' },
        { mimetype: 'image/gif', expectedExt: 'gif' },
      ];

      testCases.forEach(({ mimetype, expectedExt }) => {
        const mockUuidValue = `uuid-${expectedExt}`;
        mockUuid.mockReturnValue(mockUuidValue);
        
        const mockFile: Express.Multer.File = {
          mimetype,
        } as Express.Multer.File;

        fileNamer(mockRequest, mockFile, mockCallback);

        expect(mockCallback).toHaveBeenCalledWith(null, `${mockUuidValue}.${expectedExt}`);
        mockCallback.mockClear();
      });
    });

    it('should handle empty file', () => {
      fileNamer(mockRequest, null, mockCallback);

      expect(mockCallback).toHaveBeenCalledWith(
        new Error('File is empty'), 
        false
      );
      expect(mockUuid).not.toHaveBeenCalled();
    });

    it('should handle undefined file', () => {
      fileNamer(mockRequest, undefined, mockCallback);

      expect(mockCallback).toHaveBeenCalledWith(
        new Error('File is empty'), 
        false
      );
      expect(mockUuid).not.toHaveBeenCalled();
    });
  });
});