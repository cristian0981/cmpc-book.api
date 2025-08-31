import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Genre } from './models/genre.model';
import { CreateGenreDto } from './dto/create-genre.dto';
import { UpdateGenreDto } from './dto/update-genre.dto';
import { GenresServiceInterface } from './interfaces/genres-service.interface';

@Injectable()
export class GenresService implements GenresServiceInterface {
  constructor(
    @InjectModel(Genre)
    private readonly genreModel: typeof Genre,
  ) {}

  async create(createGenreDto: CreateGenreDto): Promise<Genre> {

      return await this.genreModel.create({
        name: createGenreDto.name,
      });
    }
  

  async findAll(): Promise<Genre[]> {
    return await this.genreModel.findAll({
      order: [['name', 'ASC']],
    });
  }

  async findOne(id: string): Promise<Genre> {
    const genre = await this.genreModel.findByPk(id);
    if (!genre) {
      throw new NotFoundException(`Género con ID ${id} no encontrado`);
    }
    return genre;
  }

  async update(id: string, updateGenreDto: UpdateGenreDto): Promise<Genre> {
    const genre = await this.genreModel.findByPk(id);
    if (!genre) {
      throw new NotFoundException(`Género con ID ${id} no encontrado`);
    }
    
    try {
      await genre.update(updateGenreDto);
      return genre;
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        throw new ConflictException('Ya existe un género con ese nombre');
      }
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    const genre = await this.genreModel.findByPk(id);
    if (!genre) {
      throw new NotFoundException(`Género con ID ${id} no encontrado`);
    }
    await genre.destroy();
  }

  async findByName(name: string): Promise<Genre | null> {
    return await this.genreModel.findOne({
      where: { name },
    });
  }
}
