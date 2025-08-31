import { 
  BadRequestException, 
  Controller, 
  Get, 
  Param, 
  Post, 
  Res, 
  UploadedFile, 
  UseInterceptors 
} from '@nestjs/common';
import { FilesService } from './files.service';
import { Response } from 'express';
import { fileFilter, fileNamer } from './helpers';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { envs } from '../settings/envs';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiConsumes,
  ApiBody,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiCreatedResponse,
  ApiOkResponse
} from '@nestjs/swagger';

@ApiTags('Files')
@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Get('books/:bookName')
  @ApiOperation({
    summary: 'Obtener imagen de libro',
    description: 'Recupera una imagen de libro específica por su nombre de archivo'
  })
  @ApiParam({
    name: 'bookName',
    description: 'Nombre del archivo de imagen del libro (incluyendo extensión)',
    example: 'libro-ejemplo.jpg',
    type: String
  })
  @ApiOkResponse({
    description: 'Imagen del libro encontrada y enviada exitosamente',
    content: {
      'image/jpeg': {
        schema: {
          type: 'string',
          format: 'binary'
        }
      },
      'image/png': {
        schema: {
          type: 'string',
          format: 'binary'
        }
      },
      'image/gif': {
        schema: {
          type: 'string',
          format: 'binary'
        }
      }
    }
  })
  @ApiNotFoundResponse({
    description: 'Imagen no encontrada',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: { type: 'string', example: 'No book found with image libro-ejemplo.jpg' },
        error: { type: 'string', example: 'Bad Request' }
      }
    }
  })
  findBookImage(
    @Res() res: Response,
    @Param('bookName') bookName: string
  ) {
    const path = this.filesService.getStaticBookImage(bookName);
    res.sendFile(path);
  }

  @Post('books')
  @ApiOperation({
    summary: 'Subir imagen de libro',
    description: 'Sube una nueva imagen para un libro. Solo se permiten archivos de imagen (JPG, JPEG, PNG, GIF)'
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Archivo de imagen para subir',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Archivo de imagen (JPG, JPEG, PNG, GIF)'
        }
      },
      required: ['file']
    }
  })
  @ApiCreatedResponse({
    description: 'Imagen subida exitosamente',
    schema: {
      type: 'object',
      properties: {
        secureUrl: {
          type: 'string',
          description: 'URL segura para acceder a la imagen subida',
          example: 'http://localhost:3000/uploads/books/550e8400-e29b-41d4-a716-446655440000.jpg'
        }
      }
    }
  })
  @ApiBadRequestResponse({
    description: 'Error en la subida del archivo',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: { 
          type: 'string', 
          example: 'Make sure that the file is an image' 
        },
        error: { type: 'string', example: 'Bad Request' }
      }
    }
  })
  @UseInterceptors(FileInterceptor('file', {
    fileFilter: fileFilter,
    storage: diskStorage({
      destination: './uploads/books',
      filename: fileNamer
    })
  }))
  uploadBookImage(
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('La extension del archivo no es válida');
    }

    const secureUrl = `${envs.files_api}/books/${file.filename}`;
    return { secureUrl };
  }
}
