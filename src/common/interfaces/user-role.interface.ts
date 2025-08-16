import { RoleEnum } from 'src/common/enums';

export interface RequestWithUser {
  user?: {
    id?: string | number;
    role?: RoleEnum;
    roles?: RoleEnum[];
  };
}
