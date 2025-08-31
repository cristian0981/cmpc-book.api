import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  Unique,
  AllowNull,
  CreatedAt,
  UpdatedAt,
  DeletedAt,
} from 'sequelize-typescript';
import { ApiProperty } from '@nestjs/swagger';

@Table({
  tableName: 'authors',
  paranoid: true, // Soft delete
})
export class Author extends Model<Author> {
  @ApiProperty({
    description: 'ID único del autor',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id: string;

  @ApiProperty({
    description: 'Nombre del autor',
    example: 'Gabriel García Márquez',
    maxLength: 255,
  })
  @Unique
  @AllowNull(false)
  @Column({
    type: DataType.STRING(255),
    validate: {
      notEmpty: {
        msg: 'El nombre del autor no puede estar vacío',
      },
      len: {
        args: [1, 255],
        msg: 'El nombre del autor debe tener entre 1 y 255 caracteres',
      },
    },
  })
  name: string;

  @ApiProperty({
    description: 'Fecha de creación',
    example: '2024-01-01T00:00:00.000Z',
  })
  @CreatedAt
  createdAt: Date;

  @ApiProperty({
    description: 'Fecha de última actualización',
    example: '2024-01-01T00:00:00.000Z',
  })
  @UpdatedAt
  updatedAt: Date;

  @DeletedAt
  deletedAt: Date;
}