import { Table, Column, Model, DataType, CreatedAt, UpdatedAt, DeletedAt } from 'sequelize-typescript';
import { ValidRoles } from '../interfaces';
import { object } from 'joi';

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
    type: DataType.TEXT, // Especificar longitud explícita
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
    type: DataType.STRING(600), // Especificar longitud explícita
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
    type: DataType.TEXT,
    allowNull: true,
  })
  refreshToken: string;


  @Column({
    type: DataType.ARRAY(DataType.STRING),
    defaultValue: [ValidRoles.admin],
    allowNull: true,
    validate: {
      isValidRoles(value: string[]) {
        if (value && value.some(role => !Object.values(ValidRoles).includes(role as ValidRoles))) {
          throw new Error('Invalid role provided');
        }
      }
    }
  })
  roles?: ValidRoles[];

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