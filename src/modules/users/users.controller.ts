import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Query,
} from '@nestjs/common';
import { UpdateUserDto } from './dtos/update-user.dto';
import { UsersService } from './users.service';
import { Serialize } from '../../interceptors/serialize.interceptor';
import { UserDto } from './dtos/user.dto';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { IApiResponse } from 'src/types/api.types';
import { User } from './entities/user.entity';

@ApiTags('Users')
@ApiBearerAuth('jwtAuth')
@Serialize(UserDto) // to serialize all req handler of a controller , if you want to only serialize response of particular handlers remove it from this controller and place it in only those handlers
@Controller('users')
export class UsersController {
  constructor(private userService: UsersService) {}

  @ApiOkResponse({ description: 'Gives list of users', type: UserDto })
  @HttpCode(HttpStatus.OK)
  @Get('/users')
  async listAllUsers(): Promise<IApiResponse<User[]>> {
    const users = await this.userService.find();
    const response = {
      success: true,
      message: 'Fetched list of users successfully',
      data: users,
    };

    return response;
  }

  @ApiOkResponse({ description: 'Gives user using email', type: UserDto })
  @HttpCode(HttpStatus.OK)
  @Get('/email')
  async findUserByEmail(
    @Query('email') email: string,
  ): Promise<IApiResponse<User>> {
    const user = await this.userService.findOneByEmail(email);
    if (!user) {
      throw new NotFoundException('user not found');
    }

    const response = {
      success: true,
      message: 'Fetched user with provided email successfully',
      data: user,
    };

    return response;
  }

  @ApiOkResponse({ description: 'Gives user using id', type: UserDto })
  @HttpCode(HttpStatus.OK)
  @Get('/:id')
  async findUserById(
    @Param('id', ParseIntPipe) id: string,
  ): Promise<IApiResponse<User>> {
    // console.log('Request Handler is running');
    const user = await this.userService.findOne(parseInt(id));
    if (!user) {
      throw new NotFoundException('user not found');
    }

    const response = {
      success: true,
      message: 'Fetched user with provided id successfully',
      data: user,
    };

    return response;
  }

  // @Get()
  // async findUsersByEmail(@Query('email') email: string) {
  //   const user = await this.userService.findAllByEmail(email);
  //   if (!user) {
  //     throw new NotFoundException('User not found!');
  //   }
  //   return user;
  // }

  @ApiOkResponse({ description: 'Update user with centain id', type: UserDto })
  @HttpCode(HttpStatus.OK)
  @Patch('/:id')
  async updateUser(
    @Param('id', ParseIntPipe) id: string,
    @Body() body: UpdateUserDto,
  ): Promise<IApiResponse<User>> {
    const user = await this.userService.update(parseInt(id), body);

    const response = {
      success: true,
      message: 'Updated user successfully',
      data: user,
    };

    return response;
  }

  @ApiOkResponse({ description: 'Delete user with centain id', type: UserDto })
  @HttpCode(HttpStatus.OK)
  @Delete('/:id')
  async removeUser(
    @Param('id', ParseIntPipe) id: string,
  ): Promise<IApiResponse<User>> {
    const user = await this.userService.remove(parseInt(id));

    const response = {
      success: true,
      message: 'Deleted user successfully',
      data: user,
    };

    return response;
  }
}
