import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { existsSync, mkdirSync } from 'fs';
import { BooksService } from './books.service';
import { BooksController } from './books.controller';
import { Book } from './models/book.model';
import { Author } from '../authors/models/author.model';
import { Editorial } from '../editorials/models/editorial.model';
import { Genre } from '../genres/models/genre.model';
import { Auth } from '../auth/models/auth.model';
import { AuthorsModule } from '../authors/authors.module';
import { EditorialsModule } from '../editorials/editorials.module';
import { GenresModule } from '../genres/genres.module';
import { AuthModule } from '../auth/auth.module';
import { FilesModule } from '../files/files.module';
import { FilesService } from '../files/files.service';

// Crear directorio de uploads si no existe
const uploadDir = './uploads/books';
if (!existsSync(uploadDir)) {
  mkdirSync(uploadDir, { recursive: true });
}

@Module({
  imports: [
    // Configurar Sequelize con todos los modelos necesarios
    SequelizeModule.forFeature([
      Book,
      Author,
      Editorial,
      Genre,
      Auth
    ]),
    // Configurar Multer para subida de archivos
    MulterModule.register({
      storage: diskStorage({
        destination: uploadDir,
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
          const extension = file.originalname.split('.').pop();
          cb(null, `book-${uniqueSuffix}.${extension}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
          cb(null, true);
        } else {
          cb(new Error('Solo se permiten archivos de imagen'), false);
        }
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    }),
    // Importar módulos relacionados
    AuthorsModule,
    EditorialsModule,
    GenresModule,
    AuthModule,
    FilesModule
  ],
  controllers: [BooksController],
  providers: [BooksService, FilesService],
  exports: [BooksService], // Exportar el servicio para uso en otros módulos
})
export class BooksModule {}
