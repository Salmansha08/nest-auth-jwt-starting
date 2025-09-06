import { PaginationPresenter } from '../../../common/base';
import { CreateUserDto, FilterUserDto, UpdateUserDto } from '../dto';
import { UpdatePhotoDto } from '../dto/update-photo.dto';
import { UpdateProfileDto } from '../dto/update-profile.dto';
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

  updatePhoto(id: string, dto: UpdatePhotoDto): Promise<User>;
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

  updatePhoto(id: string, file: Express.Multer.File): Promise<UserPresenter>;

  updateProfile(id: string, dto: UpdateProfileDto): Promise<UserPresenter>;
}
