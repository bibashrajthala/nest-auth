import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { plainToClass, plainToInstance } from 'class-transformer';
import { UseInterceptors } from '@nestjs/common';

// interface that denotes a type for a class
interface ClassConstructor {
  new (...args: any[]): object;
}

export function Serialize(dto: ClassConstructor) {
  return UseInterceptors(new SerializeInterceptor(dto));
}

export class SerializeInterceptor implements NestInterceptor {
  constructor(private dto: any) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    // Run something before request is handled
    // Usually used to play with req before it is sent to route/request handler
    // console.log('Running before request handler', context);

    return next.handle().pipe(
      map((response: any) => {
        // Run something before response is sent out
        // Usually used to play with res before it is sent to user
        // console.log('Running before response is sent.', data);

        // instead of serializing whole response object, only serialize data property of response
        if ('data' in response) {
          response.data = plainToInstance(this.dto, response?.data, {
            excludeExtraneousValues: true,
          });
        }

        return response;
      }),
    );
  }
}
