import { createParamDecorator } from '@nestjs/common/decorators';
import { ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: never, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    return user;
  },
);

export const CurrentUserId = createParamDecorator(
  (data: never, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    const userId = request.user.sub;
    return userId;
  },
);
