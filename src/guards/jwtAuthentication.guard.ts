import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const isPublic = this.reflector.getAllAndOverride('isPublic', [
      context.getHandler(), // check for isPublic metadata(set by Public decorator) first in route handler(first priority)
      context.getClass(), // then check in controller
      // if found in any of two, return true else false
    ]);

    // if canActivate() returns true that means guard is surpassed
    if (isPublic) return true;

    // check for jwt and verify jwt using "jwt" strategy then return true if verified else false
    return super.canActivate(context);
  }
}
