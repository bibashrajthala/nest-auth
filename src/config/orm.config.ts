import * as dotenv from 'dotenv';
dotenv.config();

import { DataSourceOptions } from 'typeorm';
import { SeederOptions } from 'typeorm-extension';

//
// import MainSeeder from "../database/Seeders/MainSeeder";
// import MainSeederDev from "../database/Seeders/MainSeederDev";

//
const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = process.env.NODE_ENV === 'development';

//
const typeormConfig: DataSourceOptions & SeederOptions = {
  type: 'mysql',
  host: process.env.DATABASE_HOST,
  port: Number(process.env.DATABASE_PORT),
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,

  //! ALERT: Strictly avoid this in production
  synchronize: isDevelopment,

  // Logging, but not in production
  logging: false,
  logger: 'advanced-console',

  //
  cache: false,
  dropSchema: false,

  //
  migrationsTableName: process.env.MIGRATIONS_TABLE,
  migrationsTransactionMode: 'none',
  migrationsRun: false,
  ssl: isProduction,
  migrations: [__dirname + './../database/migrations/*{.ts,.js}'],
  entities: [__dirname + './../modules/**/**/*.entity{.ts,.js}'],
  subscribers: [__dirname + './../modules/**/**/*.subscriber{.ts,.js}'],
  seeds: [__dirname + './../database/seeders/*.seeder{.ts,.js}'],
  factories: [__dirname + './../database/factories/*.factory{.ts,js}'],
};

export default typeormConfig;
