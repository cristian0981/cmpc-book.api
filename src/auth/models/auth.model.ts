import { Table, Column, Model, DataType, CreatedAt, UpdatedAt, DeletedAt } from 'sequelize-typescript';

@Table({
  tableName: 'users',
  paranoid: true, // Soft delete
})
export class Auth extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id: string;

  @Column({
    type: DataType.STRING(255), // Especificar longitud explícita
    allowNull: false,
    unique: {
      name: 'email_unique',
      msg: 'El email ya está registrado',
    },
    validate: {
      isEmail: true,
      len: [1, 255] // Validación de longitud
    },
  })
  email: string;

  @Column({
    type: DataType.STRING(255), // Especificar longitud explícita
    allowNull: false,
    validate: {
      len: [6, 255] // Validación de longitud
    }
  })
  password: string;

  @Column({
    type: DataType.STRING(255), // Especificar longitud explícita
    allowNull: true,
    validate: {
      len: [0, 255] // Validación de longitud
    }
  })
  name: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  refreshToken: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true,
  })
  isActive: boolean;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @DeletedAt
  deletedAt: Date;
}