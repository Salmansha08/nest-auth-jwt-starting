import { BaseEntity } from 'src/common/base';
import { RoleEnum } from 'src/common/enums';
import { Column, Entity } from 'typeorm';

@Entity()
export class User extends BaseEntity {
  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({
    select: false,
  })
  password: string;

  @Column({
    type: 'enum',
    enum: RoleEnum,
    default: RoleEnum.USER,
  })
  role: RoleEnum;
}
