import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dtos/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { EmailVerification } from '../mails/email-verification/entities/emailVerification.entity';
import { Otp } from '../otp/entities/otp.entity';

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

    const emailVerification = new EmailVerification();
    user.emailVerification = emailVerification;

    const otp = new Otp();
    user.otp = otp;

    const saved = this.userRepository.save(user);

    return saved;

    // return this.userRepository.save(user);
  }

  //
  async find() {
    const users = await this.userRepository.find();

    return users;
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
