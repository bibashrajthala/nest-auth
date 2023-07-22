import type { ConfigModuleOptions } from '@nestjs/config';

//
const configOptions: ConfigModuleOptions = {
  cache: true,
  isGlobal: true,
};

//
export default configOptions;
