import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { GenresService } from './genres.service';
import { GenresController } from './genres.controller';
import { Genre } from './models/genre.model';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [SequelizeModule.forFeature([Genre]), AuthModule],
  controllers: [GenresController],
  providers: [GenresService],
  exports: [GenresService, SequelizeModule],
})
export class GenresModule {}
