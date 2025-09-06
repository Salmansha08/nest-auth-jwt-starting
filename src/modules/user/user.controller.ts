import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Inject,
  HttpStatus,
  Query,
  ParseUUIDPipe,
  UseGuards,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { BaseController } from '../../common/base';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { AuthUserInterface } from '../../common/interfaces';
import { FileUploadInterceptor } from '../../common/interceptors';
import { ResponseEnum, RoleEnum } from '../../common/enums';
import { ApiDoc, AuthUser, Roles } from '../../common/decorators';
import { IUserService, UserServiceToken } from './interfaces';
import { UserPresenter } from './presenter';
import { CreateUserDto, FilterUserDto, UpdateUserDto } from './dto';

@Controller('user')
@ApiTags('User')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class UserController extends BaseController {
  constructor(
    @Inject(UserServiceToken)
    private readonly _userService: IUserService,
  ) {
    super();
  }

  @Post()
  @UseGuards(RolesGuard)
  @ApiDoc(
    {
      summary: 'Create User',
      description: 'Create User',
      status: HttpStatus.CREATED,
      responseType: ResponseEnum.OBJECT,
    },
    UserPresenter,
  )
  async create(@Body() createUserDto: CreateUserDto) {
    const data = await this._userService.create(createUserDto);
    this.transformObject(UserPresenter, data);

    return this.createSuccess('User created successfully');
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.ADMIN, RoleEnum.SUPERADMIN)
  @ApiDoc(
    {
      summary: 'Get all users',
      description: 'Retrieve all users',
      status: HttpStatus.OK,
      responseType: ResponseEnum.PAGINATION,
    },
    UserPresenter,
  )
  async findAll(@Query() query: FilterUserDto) {
    const data = await this._userService.findAll(query);
    const transformedEntities = this.transformArray(
      UserPresenter,
      data.entities,
    );

    return this.findSuccess(
      {
        ...data,
        entities: transformedEntities,
      },
      'Users retrieved successfully',
    );
  }

  @Patch('/photo')
  @UseGuards(RolesGuard)
  @UseInterceptors(FileUploadInterceptor)
  @ApiDoc(
    {
      summary: 'Upload/Replace Photo',
      description: 'Update/Replace User Photo',
      status: HttpStatus.OK,
      responseType: ResponseEnum.OBJECT,
      isFileUpload: true,
    },
    UserPresenter,
  )
  async updatePhoto(
    @AuthUser() user: AuthUserInterface,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const updatedUser = await this._userService.updatePhoto(user.id, file);
    const transformedUser = this.transformObject(UserPresenter, updatedUser);

    return this.updateSuccess(
      transformedUser,
      'User photo updated successfully',
    );
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiDoc(
    {
      summary: 'Find User',
      description: 'Find User',
      status: HttpStatus.OK,
      responseType: ResponseEnum.OBJECT,
    },
    UserPresenter,
  )
  async findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    const user = await this._userService.findOne(id);
    const transformedUser = this.transformObject(UserPresenter, user);

    return this.findSuccess(transformedUser, 'User found successfully');
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.ADMIN, RoleEnum.SUPERADMIN)
  @ApiDoc(
    {
      summary: 'Update User',
      description: 'Update User',
      status: HttpStatus.OK,
      responseType: ResponseEnum.OBJECT,
    },
    UserPresenter,
  )
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const user = await this._userService.update(id, updateUserDto);
    const transformedUser = this.transformObject(UserPresenter, user);

    return this.updateSuccess(transformedUser, 'User updated successfully');
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.SUPERADMIN)
  @ApiDoc({
    summary: 'Delete User',
    description: 'Delete User',
    status: HttpStatus.OK,
    responseType: ResponseEnum.OBJECT,
  })
  async remove(@Param('id', new ParseUUIDPipe()) id: string) {
    await this._userService.remove(id);

    return this.deleteSuccess('User deleted successfully');
  }
}
