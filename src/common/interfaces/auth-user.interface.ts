import { RoleEnum } from '../enums';

export interface AuthUserInterface {
  id: string;
  email: string;
  role?: RoleEnum;
  roles?: RoleEnum[];
}
