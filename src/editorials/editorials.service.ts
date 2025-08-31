import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CreateEditorialDto } from './dto/create-editorial.dto';
import { UpdateEditorialDto } from './dto/update-editorial.dto';
import { Editorial } from './models/editorial.model';
import { EditorialsServiceInterface } from './interfaces/editorials-service.interface.';

@Injectable()
export class EditorialsService implements EditorialsServiceInterface {
  constructor(
    @InjectModel(Editorial)
    private editorialModel: typeof Editorial,
  ) {}

  async create(createEditorialDto: CreateEditorialDto): Promise<Editorial> {
    const existingEditorial = await this.findByName(createEditorialDto.name);
    if (existingEditorial) {
      throw new ConflictException('Ya existe una editorial con ese nombre');
    }

    return this.editorialModel.create(createEditorialDto as any);
  }

  async findAll(): Promise<Editorial[]> {
    return this.editorialModel.findAll({
      order: [['name', 'ASC']],
    });
  }

  async findOne(id: string): Promise<Editorial> {
    const editorial = await this.editorialModel.findByPk(id);
    if (!editorial) {
      throw new NotFoundException('Editorial no encontrada');
    }
    return editorial;
  }

  async update(id: string, updateEditorialDto: UpdateEditorialDto): Promise<Editorial> {
    const editorial = await this.findOne(id);
    
    if (updateEditorialDto.name && updateEditorialDto.name !== editorial.name) {
      const existingEditorial = await this.findByName(updateEditorialDto.name);
      if (existingEditorial) {
        throw new ConflictException('Ya existe una editorial con ese nombre');
      }
    }

    await editorial.update(updateEditorialDto);
    return editorial;
  }

  async remove(id: string): Promise<void> {
    const editorial = await this.findOne(id);
    await editorial.destroy();
  }

  private async findByName(name: string): Promise<Editorial | null> {
    return this.editorialModel.findOne({
      where: { name },
    });
  }
}
