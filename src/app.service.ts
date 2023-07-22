import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  startServer(): string {
    return 'Server is running!!';
  }
}
