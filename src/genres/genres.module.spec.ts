import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';
import { GenresModule } from './genres.module';
import { GenresService } from './genres.service';
import { GenresController } from './genres.controller';
import { Genre } from './models/genre.model';
import { AuthModule } from '../auth/auth.module';

describe('GenresModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [GenresModule, AuthModule],
    })
      .overrideProvider(getModelToken(Genre))
      .useValue({})
      .compile();
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should have GenresController', () => {
    const controller = module.get<GenresController>(GenresController);
    expect(controller).toBeDefined();
  });

  it('should have GenresService', () => {
    const service = module.get<GenresService>(GenresService);
    expect(service).toBeDefined();
  });
});