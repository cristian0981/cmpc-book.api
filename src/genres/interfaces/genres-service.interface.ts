import { CreateGenreDto } from "../dto/create-genre.dto";
import { UpdateGenreDto } from "../dto/update-genre.dto";
import { Genre } from "../models/genre.model";


export interface GenresServiceInterface {
  create(createGenreDto: CreateGenreDto): Promise<Genre>;
  findAll(): Promise<Genre[]>;
  findOne(id: string): Promise<Genre>;
  update(id: string, updateGenreDto: UpdateGenreDto): Promise<Genre>;
  remove(id: string): Promise<void>;
}