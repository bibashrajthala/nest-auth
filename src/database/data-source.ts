import { DataSource } from 'typeorm';

//
import typeormConfig from '../config/orm.config';

//
export const dataSource = new DataSource(typeormConfig);
