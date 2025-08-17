import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities';
import { UserController } from './user.controller';
import { UserRepo, UserService } from './services';
import { UserRepoToken, UserServiceToken } from './interfaces';

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([User])],
  controllers: [UserController],
  providers: [
    UserService,
    UserRepo,
    {
      provide: UserServiceToken,
      useClass: UserService,
    },
    {
      provide: UserRepoToken,
      useExisting: UserRepo,
    },
  ],
  exports: [UserService, UserRepo, UserServiceToken, UserRepoToken],
})
export class UsersModule {}
