import { BaseEntity } from '../../../common/base';
import { GenderEnum, RoleEnum } from '../../../common/enums';
import { Column, Entity } from 'typeorm';

@Entity()
export class User extends BaseEntity {
  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ select: false })
  password: string;

  @Column({
    type: 'enum',
    enum: RoleEnum,
    default: RoleEnum.USER,
  })
  role: RoleEnum;

  @Column({
    type: 'enum',
    enum: GenderEnum,
    nullable: true,
  })
  gender: GenderEnum;

  @Column({ nullable: true })
  age: number;

  @Column({ nullable: true })
  bio: string;

  @Column({ nullable: true })
  photo: string;
}
