import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { plainToInstance } from 'class-transformer';
import * as bcrypt from 'bcrypt';
import { PaginationPresenter } from '../../../common/base';
import { RoleEnum } from '../../../common/enums';
import { CreateUserDto, FilterUserDto, UpdateUserDto } from '../dto';
import { IUserRepo, IUserService, UserRepoToken } from '../interfaces';
import { UserPresenter } from '../presenter';

@Injectable()
export class UserService implements IUserService {
  private readonly logger = new Logger(UserService.name);
  private salt: string;
  private readonly SALT_ROUNDS: number;
  private readonly CACHE_TTL: number;
  private readonly userCacheKeys: Set<string> = new Set();
  private readonly CACHE_NAMESPACE = 'user';

  constructor(
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    @Inject(UserRepoToken)
    private readonly _userRepo: IUserRepo,
  ) {
    this.CACHE_TTL = this.configService.get<number>('CACHE_TTL', 60);
    this.SALT_ROUNDS = parseInt(
      this.configService.get<string>('SALT_ROUNDS') ?? '13',
      10,
    );
  }

  async onModuleInit(): Promise<void> {
    await this.initSalt(this.SALT_ROUNDS);
  }

  private async initSalt(rounds: number): Promise<void> {
    try {
      this.salt = await bcrypt.genSalt(rounds);
    } catch (error) {
      this.logger.error('Failed to generate salt:', error);
      this.salt = '10';
    }
  }

  private getUserCacheKey(id: string): string {
    return `${this.CACHE_NAMESPACE}:id:${id}`;
  }

  private getUserListCacheKey(query: FilterUserDto): string {
    return `${this.CACHE_NAMESPACE}:list:${JSON.stringify(query)}`;
  }

  private getUserEmailCacheKey(email: string): string {
    return `${this.CACHE_NAMESPACE}:email:${email}`;
  }

  private addCacheKey(key: string): void {
    this.userCacheKeys.add(key);
  }

  private async setCachedUser(key: string, user: UserPresenter): Promise<void> {
    const userSize = JSON.stringify(user).length;
    const MAX_SIZE = 100 * 1024;

    if (userSize < MAX_SIZE) {
      const safeUser = plainToInstance(UserPresenter, user);
      await this.cacheManager.set(key, safeUser, this.CACHE_TTL);
      this.addCacheKey(key);
    }
  }

  private async clearCacheByPattern(pattern: string): Promise<void> {
    try {
      if (
        this.cacheManager.stores &&
        typeof this.cacheManager.stores.keys === 'function'
      ) {
        const allKeys = Array.from(this.cacheManager.stores.keys());
        const matchingKeys = allKeys.filter((key) =>
          String(key).startsWith(pattern),
        );

        if (matchingKeys.length > 0) {
          await Promise.all(
            matchingKeys.map((key) => this.cacheManager.del(String(key))),
          );
          this.logger.debug(
            `Cleared ${matchingKeys.length} cache keys with pattern: ${pattern}`,
          );
        }
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      this.logger.error(
        `Failed to clear cache by pattern ${pattern}: ${errorMessage}`,
      );
    }
  }

  private async invalidateUserCache(id: string): Promise<void> {
    try {
      const userCacheKey = this.getUserCacheKey(id);
      await this.cacheManager.del(userCacheKey);

      const user = await this._userRepo.findOne(id);
      if (user?.email) {
        await this.cacheManager.del(this.getUserEmailCacheKey(user.email));
      }

      await this.clearCacheByPattern(`${this.CACHE_NAMESPACE}:list:`);
      this.userCacheKeys.clear();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      this.logger.error(
        `Cache invalidation error for user ${id}: ${errorMessage}`,
      );
    }
  }

  private async invalidateAllUserCache(): Promise<void> {
    try {
      await this.clearCacheByPattern(this.CACHE_NAMESPACE);

      this.userCacheKeys.clear();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      this.logger.error(`Cache invalidation error: ${errorMessage}`);
    }
  }

  async create(createUserDto: CreateUserDto): Promise<UserPresenter> {
    const { email, role, password } = createUserDto;

    if (role === RoleEnum.SUPERADMIN) {
      throw new BadRequestException(
        `Can't Create User with role ${RoleEnum.SUPERADMIN}`,
      );
    }

    const user = await this.findOneByEmail(email);
    if (user) {
      throw new ConflictException(`User with email ${email} already exists`);
    }

    const hashedPassword = await this.hashPassword(password);
    const newUserDto = { ...createUserDto, password: hashedPassword };

    const createUser = await this._userRepo.create(newUserDto);

    await this.invalidateUserCache(createUser.id);

    return createUser;
  }

  async findAll(
    query: FilterUserDto,
  ): Promise<PaginationPresenter<UserPresenter>> {
    const cacheKey = this.getUserListCacheKey(query);
    const cachedUsers =
      await this.cacheManager.get<PaginationPresenter<UserPresenter>>(cacheKey);
    if (cachedUsers) {
      return cachedUsers;
    }

    const users = await this._userRepo.findAll(query);

    const safeUser = plainToInstance(UserPresenter, users);
    await this.cacheManager.set(cacheKey, safeUser, this.CACHE_TTL);
    this.addCacheKey(cacheKey);

    return users;
  }

  async findOne(id: string): Promise<UserPresenter> {
    const cacheKey = this.getUserCacheKey(id);
    const cachedUser = await this.cacheManager.get<UserPresenter>(cacheKey);

    if (cachedUser) {
      return cachedUser;
    }

    const user = await this._userRepo.findOne(id);
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    await this.setCachedUser(cacheKey, user);

    return user;
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserPresenter> {
    const user = await this._userRepo.findOne(id);
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    if (updateUserDto.email) {
      const userExist = await this._userRepo.findOneByEmail(
        updateUserDto.email,
      );
      if (userExist) {
        throw new ConflictException(
          `User with email ${updateUserDto.email} already exists`,
        );
      }
    }

    if (updateUserDto.email && user.email !== updateUserDto.email) {
      await this.cacheManager.del(this.getUserEmailCacheKey(user.email));
    }

    let updatedData = { ...updateUserDto };

    if (updateUserDto.password) {
      if (!updateUserDto.oldPassword) {
        throw new BadRequestException(`Old password is required`);
      }

      const isMatch = await bcrypt.compare(
        updateUserDto.oldPassword,
        user.password,
      );
      if (!isMatch) {
        throw new BadRequestException(`Passwords do not match`);
      }

      const hashedPassword = await this.hashPassword(updateUserDto.password);
      updatedData = { ...updatedData, password: hashedPassword };
    }

    const updatedUserDto = { ...user, ...updatedData };
    const updatedUser = await this._userRepo.update(id, updatedUserDto);

    await this.invalidateAllUserCache();

    return updatedUser;
  }

  async remove(id: string): Promise<void> {
    const user = await this._userRepo.findOne(id);
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    await this._userRepo.remove(id);

    await this.invalidateAllUserCache();
  }

  async findOneByEmail(email: string): Promise<UserPresenter | null> {
    const cacheKey = this.getUserEmailCacheKey(email);
    try {
      const cachedUser = await this.cacheManager.get<UserPresenter>(cacheKey);
      if (cachedUser) {
        return cachedUser;
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      this.logger.warn(`Failed to get cached user by email: ${errorMessage}`);
    }

    const user = await this._userRepo.findOneByEmail(email);
    if (user) {
      try {
        await this.setCachedUser(cacheKey, user);
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);

        this.logger.warn(`Failed to cache user: ${errorMessage}`);
      }
    }
    return user;
  }

  async hashPassword(password: string): Promise<string> {
    if (!this.salt) {
      throw new Error('Salt has not been initialized');
    }
    const hashedPassword = await bcrypt.hash(password, this.salt);

    return hashedPassword;
  }
}
