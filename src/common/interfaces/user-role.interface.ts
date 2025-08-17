import { RoleEnum } from '../enums';

export interface RequestWithUser {
  user?: {
    id?: string;
    email?: string;
    role?: RoleEnum;
    roles?: RoleEnum[];
  };
}
