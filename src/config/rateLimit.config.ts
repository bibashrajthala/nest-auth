import * as dotenv from 'dotenv';
dotenv.config();

import { ThrottlerModuleOptions } from '@nestjs/throttler';

const throttlerConfig: ThrottlerModuleOptions = {
  ttl: parseInt(process.env.THROTTLE_TTL),
  limit: parseInt(process.env.THROTTLE_LIMIT),
};

export default throttlerConfig;
