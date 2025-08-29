import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { CommonModule } from './common/common.module';
import { BooksModule } from './books/books.module';

@Module({
  imports: [DatabaseModule, AuthModule, CommonModule, BooksModule],

})
export class AppModule {}
