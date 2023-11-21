import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { EmailVerificationToken } from './entities/emailVerificationToken.entity';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/modules/auth/decorators/public.decorator';
import { IApiResponse } from 'src/types/api.types';
import { EmailVerificationService } from './email-verification.service';
import { EmailVerificationDto } from './dtos/emailVerification.dto';

@ApiTags('Email verification')
@Controller('email-verification')
export class EmailVerificationController {
  constructor(private emailVerificationService: EmailVerificationService) {}

  // confrim email verification
  @ApiOkResponse({
    description: 'Succesfully Verified Email!',
  })
  @HttpCode(HttpStatus.OK)
  @Public()
  @Get('/confirm/:token')
  async confirmEmailVerification(
    @Param('token') token: string,
  ): Promise<IApiResponse<any>> {
    const email = await this.emailVerificationService.decodeConfirmationToken(
      token,
    );

    if (!email) throw new BadRequestException('Invalid token');

    await this.emailVerificationService.confirmEmail(email, token);

    const response = {
      success: true,
      message: 'Succesfully Verified Email!',
    };
    return response;
  }
}
