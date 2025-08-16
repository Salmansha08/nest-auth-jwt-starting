import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Inject,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { BaseController } from 'src/common/base';
import { ApiDoc, Roles } from 'src/common/decorators';
import { ResponseEnum, RoleEnum } from 'src/common/enums';
import { JwtAuthGuard, RolesGuard } from 'src/common/guards';
import { LoginDto, RegisterDto } from './dto';
import { AuthServiceToken, IAuthService } from './interfaces';
import { plainToInstance } from 'class-transformer';
import { ThrottlerGuard } from '@nestjs/throttler';
import { LoginPresenter } from './presenter';
import { UserPresenter } from '../user/presenter';
import { RequestWithUser } from 'src/common/interfaces';

@Controller('auth')
@ApiTags('Auth')
export class AuthController extends BaseController {
  constructor(
    @Inject(AuthServiceToken)
    private readonly _authService: IAuthService,
  ) {
    super();
  }

  @Post('login')
  @UseGuards(ThrottlerGuard)
  @ApiDoc(
    {
      summary: 'Login User',
      description: 'Login User',
      status: HttpStatus.OK,
      responseType: ResponseEnum.OBJECT,
    },
    LoginPresenter,
  )
  async login(@Body() loginDto: LoginDto) {
    const data = await this._authService.login(loginDto);
    return {
      message: 'Login successful',
      data: plainToInstance(LoginPresenter, data),
    };
  }

  @Post('register')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.ADMIN)
  @ApiDoc(
    {
      summary: 'Register User',
      description: 'Register new user',
      status: HttpStatus.CREATED,
      responseType: ResponseEnum.OBJECT,
    },
    UserPresenter,
  )
  async register(@Body() registerDto: RegisterDto) {
    const data = await this._authService.register(registerDto);
    return {
      message: 'Registration successful',
      data: plainToInstance(UserPresenter, data),
    };
  }

  @Get('me')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiDoc(
    {
      summary: 'Get the currently logged-in user',
      description: 'Get the currently logged-in user',
      status: HttpStatus.OK,
      responseType: ResponseEnum.OBJECT,
    },
    UserPresenter,
  )
  getCurrentUser(@Req() req: RequestWithUser) {
    const data = req.user;
    return {
      message: 'Current user fetched successfully',
      data: plainToInstance(UserPresenter, data),
    };
  }
}
