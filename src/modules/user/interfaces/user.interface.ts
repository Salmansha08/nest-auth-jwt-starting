import { PaginationPresenter } from 'src/common/base';
import { CreateUserDto, FilterUserDto, UpdateUserDto } from '../dto';
import { User } from '../entities';
import { UserPresenter } from '../presenter';

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
