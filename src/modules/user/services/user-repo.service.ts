import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { PaginationPresenter } from 'src/common/base';
import { User } from 'src/modules/user/entities';
import {
  CreateUserDto,
  FilterUserDto,
  UpdateUserDto,
} from 'src/modules/user/dto';
import { IUserRepo } from 'src/modules/user/interfaces';
import { SortOrderEnum } from 'src/common/enums';

@Injectable()
export class UserRepo implements IUserRepo {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.userRepository.create(createUserDto);
    return this.userRepository.save(user);
  }

  async findAll(query: FilterUserDto): Promise<PaginationPresenter<User>> {
    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .orderBy('user.createdAt', SortOrderEnum.DESC);

    if (query.search) {
      queryBuilder.andWhere(
        new Brackets((qb) => {
          qb.where('user.email ILIKE :email', {
            email: `%${query.search}%`,
          }).orWhere('user.name ILIKE :name', { name: `%${query.search}%` });
        }),
      );
    }

    let limit = 10;
    let page = 1;

    if (query.isPagination) {
      limit = query.limit && query.limit > 0 ? query.limit : 10;
      page = query.page && query.page >= 1 ? query.page : 1;
      const skip = (page - 1) * limit;

      queryBuilder.skip(skip).take(limit);
    }

    const [entities, totalItems] = await queryBuilder.getManyAndCount();

    return {
      entities,
      meta: {
        page,
        limit,
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
      },
    };
  }

  async findOne(id: string): Promise<User | null> {
    const user = await this.userRepository.findOneBy({ id });
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    return this.userRepository.save({
      ...user,
      ...updateUserDto,
    });
  }

  async remove(id: string): Promise<void> {
    await this.userRepository.delete(id);
  }

  async findOneByEmail(email: string): Promise<User | null> {
    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .where('user.email = :email', { email })
      .andWhere('user.deletedAt IS NULL');

    queryBuilder.addSelect([
      'user.password',
      'user.email',
      'user.role',
      'user.name',
    ]);

    const user = await queryBuilder.getOne();

    return user;
  }
}
