import { CreateEditorialDto } from "../dto/create-editorial.dto";
import { UpdateEditorialDto } from "../dto/update-editorial.dto";
import { Editorial } from "../models/editorial.model";


export interface EditorialsServiceInterface {
  findAll(): Promise<Editorial[]>;
  findOne(id: string): Promise<Editorial>;
  create(editorial: CreateEditorialDto): Promise<Editorial>;
  update(id: string, editorial: UpdateEditorialDto): Promise<Editorial>;
  remove(id: string): Promise<void>;
}
