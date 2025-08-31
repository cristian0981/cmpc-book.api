import {
  Table,
  Column,
  Model,
  DataType,
  CreatedAt,
  UpdatedAt,
  DeletedAt,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { ApiProperty } from '@nestjs/swagger';
import { Author } from '../../authors/models/author.model';
import { Editorial } from '../../editorials/models/editorial.model';
import { Genre } from '../../genres/models/genre.model';
import { Auth } from '../../auth/models/auth.model';

@Table({
  tableName: 'books',
  paranoid: true, // Soft delete
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  deletedAt: 'deletedAt',
})
export class Book extends Model {
  @ApiProperty({
    description: 'ID único del libro',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id: string;

  @ApiProperty({
    description: 'Título del libro',
    example: 'Cien años de soledad',
    maxLength: 255,
  })
  @Column({
    type: DataType.STRING(255),
    allowNull: false,
    validate: {
      len: [1, 255],
      notEmpty: true,
    },
  })
  title: string;

  @ApiProperty({
    description: 'ID del autor',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ForeignKey(() => Author)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  authorId: string;

  @ApiProperty({
    description: 'ID de la editorial',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ForeignKey(() => Editorial)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  editorialId: string;

  @ApiProperty({
    description: 'ID del género',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ForeignKey(() => Genre)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    
  })
  genreId: string;

  @ApiProperty({
    description: 'Precio del libro',
    example: 25.99,
    type: 'number',
    format: 'decimal',
  })
  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0,
    },
  })
  price: number;

  @ApiProperty({
    description: 'Disponibilidad del libro',
    example: true,
  })
  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true,
    allowNull: false,
  })
  availability: boolean;

  @ApiProperty({
    description: 'URL de la imagen del libro',
    example: 'https://example.com/images/book.jpg',
    required: false,
  })
  @Column({
    type: DataType.STRING(500),
    allowNull: true,
  })
  imageUrl: string;

  // ✅ CAMPOS DE AUDITORÍA - Solo atributos
  @ApiProperty({
    description: 'ID del usuario que creó el registro',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ForeignKey(() => Auth)
  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  createdBy?: string;

  @ApiProperty({
    description: 'ID del usuario que actualizó el registro',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ForeignKey(() => Auth)
  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  updatedBy: string;

  @ApiProperty({
    description: 'ID del usuario que eliminó el registro',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ForeignKey(() => Auth)
  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  deletedBy: string;

  @ApiProperty({
    description: 'Stock disponible',
    example: 100,
    type: 'number',
  })
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
  })
  stock: number;

  @ApiProperty({
    description: 'Fecha de publicación',
    example: '2024-01-15',
    type: 'string',
    format: 'date',
  })
  @Column({
    type: DataType.DATEONLY,
    allowNull: false,
  })
  publishedAt: Date;

  // ✅ CAMPOS DE TIMESTAMP
  @ApiProperty({
    description: 'Fecha de creación',
    example: '2024-01-15T10:30:00Z',
  })
  @CreatedAt
  createdAt: Date;

  @ApiProperty({
    description: 'Fecha de última actualización',
    example: '2024-01-15T10:30:00Z',
  })
  @UpdatedAt
  updatedAt: Date;

  @DeletedAt
  deletedAt: Date;

  // ✅ ASOCIACIONES - Separadas de los atributos
  @ApiProperty({
    description: 'Información del autor',
    type: () => Author,
  })
  @BelongsTo(() => Author)
  author: Author;

  @ApiProperty({
    description: 'Información de la editorial',
    type: () => Editorial,
  })
  @BelongsTo(() => Editorial)
  editorial: Editorial;

  @ApiProperty({
    description: 'Información del género',
    type: () => Genre,
  })
  @BelongsTo(() => Genre)
  genre: Genre;

  // ✅ ASOCIACIONES DE AUDITORÍA - Con alias únicos
  @ApiProperty({
    description: 'Usuario que creó el registro',
    type: () => Auth,
  })
  @BelongsTo(() => Auth, { foreignKey: 'createdBy', as: 'creator' })
  creator: Auth;

  @ApiProperty({
    description: 'Usuario que actualizó el registro',
    type: () => Auth,
  })
  @BelongsTo(() => Auth, { foreignKey: 'updatedBy', as: 'updater' })
  updater: Auth;

  @ApiProperty({
    description: 'Usuario que eliminó el registro',
    type: () => Auth,
  })
  @BelongsTo(() => Auth, { foreignKey: 'deletedBy', as: 'deleter' })
  deleter: Auth;
}
