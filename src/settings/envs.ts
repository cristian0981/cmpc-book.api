import 'dotenv/config';
import * as joi from 'joi';

interface EnvVars {
  PORT: number;
  JWT_SECRET: string;
  JWT_REFRESH_SECRET: string;
  DB_HOST: string;
  DB_PORT: number;
  DB_USER: string;
  DB_PASSWORD: string;
  DB_NAME: string;
  CORS_ORIGIN: string;
  MAX_FILE_SIZE: number;
  UPLOAD_PATH: string;

}

const envsSchema = joi.object({
  PORT: joi.number().required(),
  JWT_SECRET: joi.string().required(),
  JWT_REFRESH_SECRET: joi.string().required(),
  DB_HOST: joi.string().required(),
  DB_PORT: joi.number().required(),
  DB_USER: joi.string().required(),
  DB_PASSWORD: joi.string().required(),
  DB_NAME: joi.string().required(), 
  CORS_ORIGIN: joi.string().required(),
  MAX_FILE_SIZE: joi.number().required(),
  UPLOAD_PATH: joi.string().required(),
})          
.unknown(true);

const { error, value } = envsSchema.validate({ 
  ...process.env,
});


if ( error ) {
  throw new Error(`Config validation error: ${ error.message }`);
}

const envVars:EnvVars = value;

export const envs = {
  port: envVars.PORT,
  jwt_secret: envVars.JWT_SECRET,
  jwt_refresh_secret: envVars.JWT_REFRESH_SECRET,
  db_host: envVars.DB_HOST,
  db_port: envVars.DB_PORT,
  db_user: envVars.DB_USER,
  db_password: envVars.DB_PASSWORD,
  db_name: envVars.DB_NAME,
  cors_origin: envVars.CORS_ORIGIN,
  max_file_size: envVars.MAX_FILE_SIZE,
  upload_path: envVars.UPLOAD_PATH,
}