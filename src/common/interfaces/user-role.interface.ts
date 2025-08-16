import { RoleEnum } from 'src/common/enums';

export interface RequestWithUser {
  user?: {
    id?: string;
    email?: string;
    role?: RoleEnum;
    roles?: RoleEnum[];
  };
}
