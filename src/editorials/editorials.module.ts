import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { EditorialsService } from './editorials.service';
import { EditorialsController } from './editorials.controller';
import { Editorial } from './models/editorial.model';

@Module({
  imports: [SequelizeModule.forFeature([Editorial])],
  controllers: [EditorialsController],
  providers: [EditorialsService],
  exports: [EditorialsService],
})
export class EditorialsModule {}
