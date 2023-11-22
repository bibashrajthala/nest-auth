import {
  BadRequestException,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
} from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/modules/auth/decorators/public.decorator';
import { IApiResponse } from 'src/types/api.types';
import { EmailVerificationService } from './email-verification.service';

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
  ): Promise<IApiResponse<never>> {
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
