import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CreateAuthorDto } from './dto/create-author.dto';
import { UpdateAuthorDto } from './dto/update-author.dto';
import { Author } from './models/author.model';
import { AuthorsServiceInterface } from './interfaces/authors-service.interface';

@Injectable()
export class AuthorsService implements AuthorsServiceInterface {
  constructor(
    @InjectModel(Author)
    private readonly authorModel: typeof Author,
  ) {}

  async create(createAuthorDto: CreateAuthorDto): Promise<Author> {
    // Verificar si ya existe un autor con el mismo nombre
    const existingAuthor = await this.authorModel.findOne({
      where: { name: createAuthorDto.name },
    });

    if (existingAuthor) {
      throw new ConflictException('Ya existe un autor con ese nombre');
    }

    return await this.authorModel.create({
      name: createAuthorDto.name,
    });
  }

  async findAll(): Promise<Author[]> {
    return await this.authorModel.findAll({
      order: [['name', 'ASC']],
    });
  }

  async findOne(id: string): Promise<Author> {
    const author = await this.authorModel.findByPk(id);
    if (!author) {
      throw new NotFoundException(`Autor con ID ${id} no encontrado`);
    }
    return author;
  }

  async update(id: string, updateAuthorDto: UpdateAuthorDto): Promise<Author> {
    const author = await this.authorModel.findByPk(id);
    if (!author) {
      throw new NotFoundException(`Autor con ID ${id} no encontrado`);
    }

    // Verificar si el nuevo nombre ya existe (si se está actualizando el nombre)
    if (updateAuthorDto.name && updateAuthorDto.name !== author.name) {
      const existingAuthor = await this.authorModel.findOne({
        where: { name: updateAuthorDto.name },
      });

      if (existingAuthor) {
        throw new ConflictException('Ya existe un autor con ese nombre');
      }
    }

    await author.update(updateAuthorDto);
    return author;
  }

  async remove(id: string): Promise<void> {
    const author = await this.authorModel.findByPk(id);
    if (!author) {
      throw new NotFoundException(`Autor con ID ${id} no encontrado`);
    }
    await author.destroy();
  }

  async findByName(name: string): Promise<Author | null> {
    return await this.authorModel.findOne({
      where: { name },
    });
  }
}
