import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import { BaseController } from '../../common/base';
import { AuthServiceToken, IAuthService } from './interfaces';
import { ApiDoc } from '../../common/decorators';
import { ResponseEnum } from '../../common/enums';
import { LoginPresenter, MePresenter } from './presenter';
import { LoginDto, RegisterDto } from './dto';
import { UserPresenter } from '../user/presenter';
import { JwtAuthGuard } from '../../common/guards';
import { RequestWithUser } from '../../common/interfaces';

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
  @HttpCode(HttpStatus.OK)
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
    const transformedData = this.transformObject(LoginPresenter, data);

    return this.findSuccess(transformedData, 'User logged in successfully');
  }

  @Post('register')
  @UseGuards(ThrottlerGuard)
  @ApiDoc(
    {
      summary: 'Register User (only for role USER)',
      description: 'Register new user (only for role USER)',
      status: HttpStatus.CREATED,
      responseType: ResponseEnum.OBJECT,
    },
    UserPresenter,
  )
  async register(@Body() registerDto: RegisterDto) {
    const data = await this._authService.register(registerDto);
    const transformedData = this.transformObject(UserPresenter, data);

    return this.findSuccess(transformedData, 'User registered successfully');
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
    MePresenter,
  )
  getCurrentUser(@Req() req: RequestWithUser) {
    if (!req.user) {
      return this.unauthorized('User not found');
    }

    const transformedData = this.transformObject(MePresenter, req.user);

    return this.findSuccess(
      transformedData,
      'Current user fetched successfully',
    );
  }
}
