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
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { BaseController } from '../../common/base';
import { ApiDoc, Roles } from '../../common/decorators';
import { ResponseEnum, RoleEnum } from '../../common/enums';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { CreateUserDto, UpdateUserDto, FilterUserDto } from './dto';
import { IUserService, UserServiceToken } from './interfaces';
import { UserPresenter } from './presenter';

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
  @Roles(RoleEnum.SUPERADMIN, RoleEnum.ADMIN)
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
