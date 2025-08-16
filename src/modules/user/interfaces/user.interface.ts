import { User } from 'src/modules/user/entities';
import {
  CreateUserDto,
  FilterUserDto,
  UpdateUserDto,
} from 'src/modules/user/dto';
import { UserPresenter } from 'src/modules/user/presenter';
import { PaginationPresenter } from 'src/common/base';

export const UserRepoToken = Symbol('UserRepoToken');

export interface IUserRepo {
  create(createUserDto: CreateUserDto): Promise<User>;

  findAll(query: FilterUserDto): Promise<PaginationPresenter<User>>;

  findOne(id: string): Promise<User | null>;

  update(id: string, updateUserDto: UpdateUserDto): Promise<User>;

  remove(id: string): Promise<void>;

  findOneByEmail(email: string): Promise<User | null>;
}

export const UserServiceToken = Symbol('UserServiceToken');

export interface IUserService {
  create(createUserDto: CreateUserDto): Promise<UserPresenter>;

  findAll(query: FilterUserDto): Promise<PaginationPresenter<UserPresenter>>;

  findOne(id: string): Promise<UserPresenter>;

  update(id: string, updateUserDto: UpdateUserDto): Promise<UserPresenter>;

  remove(id: string): Promise<void>;

  findOneByEmail(email: string): Promise<UserPresenter | null>;

  hashPassword(password: string): Promise<string>;
}
