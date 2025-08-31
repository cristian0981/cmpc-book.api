import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { CommonModule } from './common/common.module';
import { BooksModule } from './books/books.module';
import { AuthorsModule } from './authors/authors.module';
import { EditorialsModule } from './editorials/editorials.module';
import { GenresModule } from './genres/genres.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TransformInterceptorRequest } from './common/interceptors/transfrom-data.interceptor';
import { FilesModule } from './files/files.module';

@Module({
  imports: [DatabaseModule, AuthModule, CommonModule, BooksModule, AuthorsModule, EditorialsModule, GenresModule, FilesModule],
  providers:[
      {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptorRequest,
    },
  ]

})
export class AppModule {}
