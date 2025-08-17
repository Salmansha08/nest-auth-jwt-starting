import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { plainToInstance } from 'class-transformer';
import * as bcrypt from 'bcrypt';
import { RoleEnum } from '../../common/enums';
import { JwtPayload } from '../../common/interfaces';
import { RegisterDto, LoginDto } from './dto';
import { IAuthService } from './interfaces';
import {
  IUserRepo,
  IUserService,
  UserRepoToken,
  UserServiceToken,
} from '../user/interfaces';
import { UserPresenter } from '../user/presenter';
import { LoginPresenter } from './presenter';
import { CreateUserDto } from '../user/dto';

@Injectable()
export class AuthService implements IAuthService {
  private readonly logger = new Logger(AuthService.name);

  private readonly expiresIn: string;
  private readonly jwtSecret: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    @Inject(UserServiceToken)
    private readonly userService: IUserService,
    @Inject(UserRepoToken)
    private readonly userRepo: IUserRepo,
  ) {
    this.jwtSecret = this.configService.getOrThrow<string>('JWT_SECRET');
    this.expiresIn = this.configService.getOrThrow<string>('JWT_EXPIRES_IN');
  }

  private createJwtPayload(user: UserPresenter) {
    return {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
  }

  private async generateAccessToken(
    payload: JwtPayload,
    expiresIn: string,
  ): Promise<string> {
    return this.jwtService.signAsync(payload, {
      expiresIn,
      secret: this.jwtSecret,
    });
  }

  async register(registerDto: RegisterDto): Promise<UserPresenter> {
    const { password, confirmPassword } = registerDto;

    if (password !== confirmPassword) {
      this.logger.error('Password and confirm password do not match');
      throw new BadRequestException(
        'Password and confirm password do not match',
      );
    }

    const userRegisterDto: CreateUserDto = {
      ...registerDto,
      role: RoleEnum.USER,
    };

    const user = await this.userService.create(userRegisterDto);

    return user;
  }

  async login(loginDto: LoginDto): Promise<LoginPresenter> {
    const user = await this.userRepo.findOneByEmail(loginDto.email);
    if (!user) {
      this.logger.error(
        `Login attempt with non-existent email: ${loginDto.email}`,
      );
      throw new UnauthorizedException(`Invalid email or password`);
    }

    if (!user.password || !user.email || !user.role) {
      this.logger.warn(`Incomplete user data for login: ${loginDto.email}`);
      throw new UnauthorizedException(`Invalid email or password`);
    }

    const isMatch = await bcrypt.compare(loginDto.password, user.password);
    if (!isMatch) {
      this.logger.error(`Failed login attempt for user: ${user.email}`);
      throw new UnauthorizedException(`Invalid email or password`);
    }

    const payload = this.createJwtPayload(user);
    if (!payload.sub || !payload.email || !payload.role) {
      this.logger.error('Invalid token payload', payload);
      throw new UnauthorizedException('Invalid token payload');
    }

    const expiresIn = loginDto.rememberMe ? this.expiresIn : '1d';
    const accessToken = await this.generateAccessToken(payload, expiresIn);

    const safeUser = plainToInstance(UserPresenter, user, {
      excludeExtraneousValues: true,
    });

    const userData = {
      user: safeUser,
      accessToken,
      expiresIn,
    };
    return userData;
  }
}
