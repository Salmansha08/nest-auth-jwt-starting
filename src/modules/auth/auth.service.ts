import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterDto, LoginDto } from './dto';
import { IAuthService } from './interfaces';
import { plainToInstance } from 'class-transformer';
import {
  IUserRepo,
  IUserService,
  UserRepoToken,
  UserServiceToken,
} from '../user/interfaces';
import { UserPresenter } from '../user/presenter';
import { LoginPresenter } from './presenter';

interface Payload {
  sub: string;
  email: string;
  role: string;
}
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
    payload: Payload,
    expiresIn: string,
  ): Promise<string> {
    return this.jwtService.signAsync(payload, {
      expiresIn,
      secret: this.jwtSecret,
    });
  }

  async register(registerDto: RegisterDto): Promise<UserPresenter> {
    try {
      const user = await this.userService.create(registerDto);

      return user;
    } catch (error) {
      this.logger.error('Error registering user', error);
      throw new BadRequestException('Registration failed');
    }
  }

  async login(loginDto: LoginDto): Promise<LoginPresenter> {
    const user = await this.userRepo.findOneByEmail(loginDto.email);
    if (!user) {
      this.logger.warn(
        `Login attempt with non-existent email: ${loginDto.email}`,
      );
      throw new UnauthorizedException(`Invalid email or password`);
    }

    const isMatch = await bcrypt.compare(loginDto.password, user.password);
    if (!isMatch) {
      this.logger.warn(`Failed login attempt for user: ${user.email}`);
      throw new UnauthorizedException(`Invalid email or password`);
    }

    const payload = this.createJwtPayload(user);
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
