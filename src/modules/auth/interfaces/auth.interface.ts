import { UserPresenter } from 'src/modules/user/presenter';
import { LoginDto } from '../dto';
import { LoginPresenter } from '../presenter';
import { CreateUserDto } from 'src/modules/user/dto';

/**
 * @description Auth Service Token
 */
export const AuthServiceToken = Symbol('AuthServiceToken');

/**
 * @description Auth Service Interface
 */
export interface IAuthService {
  /**
   * @description Login User
   */
  login(loginDto: LoginDto): Promise<LoginPresenter>;

  /**
   * @description Register User
   */
  register(registerDto: CreateUserDto): Promise<UserPresenter>;
}
