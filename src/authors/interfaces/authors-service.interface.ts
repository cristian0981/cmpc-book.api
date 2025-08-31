import { CreateAuthorDto } from "../dto/create-author.dto";
import { UpdateAuthorDto } from "../dto/update-author.dto";
import { Author } from "../models/author.model";

export interface AuthorsServiceInterface {
  findAll(): Promise<Author[]>;
  findOne(id: string): Promise<Author>;
  create(author: CreateAuthorDto): Promise<Author>;
  update(id: string, author: UpdateAuthorDto): Promise<Author>;
  remove(id: string): Promise<void>;
}