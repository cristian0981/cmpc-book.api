import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { envs } from '../settings/envs';

@Module({

    imports: [
        SequelizeModule.forRoot({
            dialect: 'postgres',
            host: envs.db_host,
            port: envs.db_port,
            username: envs.db_user,
            password: envs.db_password,
            database: envs.db_name,
            autoLoadModels: true,
            synchronize: true,
        }),
    ]

})
export class DatabaseModule {}
