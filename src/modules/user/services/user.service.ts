import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { compare, genSalt, hash } from 'bcrypt';
import { unlinkSync } from 'fs';
import { IUserRepo, IUserService, UserRepoToken } from '../interfaces';
import { CreateUserDto, FilterUserDto, UpdateUserDto } from '../dto';
import { UserPresenter } from '../presenter';
import { RoleEnum } from '../../../common/enums';
import { PaginationPresenter } from '../../../common/base';
import { UpdatePhotoDto } from '../dto/update-photo.dto';

@Injectable()
export class UserService implements IUserService {
  private readonly logger = new Logger(UserService.name);
  private salt: string;
  private readonly SALT_ROUNDS: number;

  constructor(
    private readonly configService: ConfigService,
    @Inject(UserRepoToken)
    private readonly _userRepo: IUserRepo,
  ) {
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
      this.salt = await genSalt(rounds);
    } catch (error) {
      this.logger.error('Failed to generate salt:', error);
      this.salt = '10';
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

    return createUser;
  }

  async findAll(
    query: FilterUserDto,
  ): Promise<PaginationPresenter<UserPresenter>> {
    const users = await this._userRepo.findAll(query);

    return users;
  }

  async findOne(id: string): Promise<UserPresenter> {
    const user = await this._userRepo.findOne(id);
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

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

    let updatedData = { ...updateUserDto };

    if (updateUserDto.password) {
      if (!updateUserDto.oldPassword) {
        throw new BadRequestException(`Old password is required`);
      }

      const isMatch = await compare(updateUserDto.oldPassword, user.password);
      if (!isMatch) {
        throw new BadRequestException(`Passwords do not match`);
      }

      const hashedPassword = await this.hashPassword(updateUserDto.password);
      updatedData = { ...updatedData, password: hashedPassword };
    }

    const updatedUserDto = { ...user, ...updatedData };
    const updatedUser = await this._userRepo.update(id, updatedUserDto);

    return updatedUser;
  }

  async remove(id: string): Promise<void> {
    const user = await this._userRepo.findOne(id);
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    await this._userRepo.remove(id);
  }

  async findOneByEmail(email: string): Promise<UserPresenter | null> {
    const user = await this._userRepo.findOneByEmail(email);

    return user;
  }

  async hashPassword(password: string): Promise<string> {
    if (!this.salt) {
      throw new Error('Salt has not been initialized');
    }
    const hashedPassword = await hash(password, this.salt);

    return hashedPassword;
  }

  async updatePhoto(
    id: string,
    file?: Express.Multer.File,
  ): Promise<UserPresenter> {
    const user = await this._userRepo.findOne(id);
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    const oldPhoto = user.photo;

    let updatedUserDto: UpdatePhotoDto;
    if (file) {
      const photo = `/uploads/${file.filename}`;
      updatedUserDto = { photo };
    } else {
      updatedUserDto = { photo: '' };
    }

    const updatedUser = await this._userRepo.updatePhoto(id, updatedUserDto);

    if (oldPhoto !== '' && oldPhoto !== null) {
      try {
        const oldPhotoPath = `.${oldPhoto}`;
        unlinkSync(oldPhotoPath);
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : 'Unknown error';
        this.logger.error(`Failed to delete old photo: ${message}`);
      }
    }

    return updatedUser;
  }
}
