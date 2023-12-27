import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dtos/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { EmailVerification } from '../mails/email-verification/entities/emailVerification.entity';
import { Otp } from '../otp/entities/otp.entity';
import { Profile } from '../profile/entities/profile.entity';
import { ListUsersQueryDto } from './dtos/list-user.dto';
import { FindOptionsWhere, ILike, Repository } from 'typeorm';
import { DEFAULT_LIMIT } from 'src/constants/defaultQueryValues';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  //
  create(userDto: CreateUserDto) {
    const user = new User();

    user.email = userDto.email;
    user.password = userDto?.password;
    user.provider = userDto?.provider;
    user.isVerified = userDto?.isVerified ?? false;

    const emailVerification = new EmailVerification();
    user.emailVerification = emailVerification;

    const otp = new Otp();
    user.otp = otp;

    const profile = new Profile();
    profile.firstName = userDto?.firstName;
    profile.middleName = userDto?.middleName;
    profile.lastName = userDto?.lastName;
    profile.profilePicture = userDto?.profilePicture ?? null;

    user.profile = profile;

    const saved = this.userRepository.save(user);

    return saved;

    // return this.userRepository.save(user);
  }

  //
  async find(query?: ListUsersQueryDto): Promise<[User[], number]> {
    const take = query?.limit ?? DEFAULT_LIMIT;
    const skip = query?.offset ?? 0;

    let filterOptions: FindOptionsWhere<User> | FindOptionsWhere<User>[] = {};

    // search
    if (query.search) {
      const searchParams = query.search.trim();
      filterOptions = [{ email: ILike(`%${searchParams}%`) }];
    }
    // and filter

    // sort
    const orderOptions: Record<string, string> = {};
    if (query?.orderBy) {
      orderOptions[query.orderBy] = query?.sort ?? 'DESC';
    }

    const [users, total] = await this.userRepository.findAndCount({
      where: filterOptions,
      take,
      skip,
      order: orderOptions,
      relations: {
        profile: true,
      },
    });

    return [users, total];
  }

  //
  async findOne(id: number) {
    if (!id) {
      return null;
    }
    const user = await this.userRepository.findOneBy({ id });

    // const user = await this.userRepository.findOne({
    //   where: {
    //     id,
    //   },
    //   select: ['id', 'email'],
    // });

    if (!user) {
      throw new NotFoundException('User not found!');
    }

    return user;
  }

  //
  async findOneByEmail(email: string) {
    const user = await this.userRepository.findOneBy({ email });

    // if (!user) {
    //   throw new NotFoundException('User not found!');
    // }

    return user;
  }

  //
  async findAllByEmail(email: string) {
    const users = await this.userRepository.find({ where: { email } });

    return users;
  }

  //
  async update(id: number, attrs: Partial<User>) {
    const user = await this.userRepository.findOneBy({ id });

    if (!user) {
      throw new NotFoundException('User not found!');
    }

    Object.assign(user, attrs);
    return this.userRepository.save(user);
  }

  //
  async remove(id: number) {
    const user = await this.userRepository.findOneBy({ id });

    if (!user) {
      throw new NotFoundException('User not found!');
    }

    return this.userRepository.remove(user);
  }
}
