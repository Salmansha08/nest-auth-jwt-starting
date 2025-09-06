import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { AuthUserInterface } from '../interfaces';

export const AuthUser = createParamDecorator(
  (
    data: keyof AuthUserInterface | undefined,
    ctx: ExecutionContext,
  ):
    | AuthUserInterface
    | AuthUserInterface[keyof AuthUserInterface]
    | undefined => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const user = request.user as AuthUserInterface;

    return data ? user?.[data] : user;
  },
);
