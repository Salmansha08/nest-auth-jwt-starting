import { UserPresenter } from '../../user/presenter';
import { CreateUserDto } from '../../user/dto';
import { LoginDto } from '../dto';
import { LoginPresenter } from '../presenter';

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
