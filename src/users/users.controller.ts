import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import {
  QueryUsersDto,
  RejectSellerDto,
  UpdateMeDto,
  UpdateUserStatusDto,
} from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '../common/enums';
import { AuthUser } from '../common/interfaces';
import { MailService } from '../mail/mail.service';
import { SELLER_MESSAGES } from '../common/constants';

@ApiTags('users')
@ApiBearerAuth('access-token')
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly mailService: MailService,
  ) {}

  @Get('me')
  @ApiOperation({ summary: 'Get logged-in user profile' })
  getMe(@CurrentUser('userId') userId: string) {
    return this.usersService.getByIdOrFail(userId);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update logged-in user/customer/seller profile' })
  updateMe(
    @CurrentUser('userId') userId: string,
    @Body() dto: UpdateMeDto,
  ) {
    return this.usersService.updateProfile(userId, dto);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Admin: list all users with filters and pagination' })
  findAll(@Query() query: QueryUsersDto) {
    return this.usersService.findAll(query);
  }

  @Get('customers')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Admin: list all customers' })
  findCustomers(@Query() query: QueryUsersDto) {
    return this.usersService.findCustomers(query);
  }

  @Get('sellers')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Admin: list all sellers' })
  findSellers(@Query() query: QueryUsersDto) {
    return this.usersService.findSellers(query);
  }

  @Get('sellers/pending')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Admin: list sellers pending approval' })
  findPendingSellers() {
    return this.usersService.findPendingSellers();
  }

  @Patch('sellers/:id/approve')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiParam({ name: 'id', description: 'Seller user id' })
  @ApiOperation({ summary: 'Admin: approve seller account' })
  async approveSeller(@Param('id') id: string) {
    const seller = await this.usersService.approveSeller(id);

    if (seller?.email) {
      await this.mailService.sendSellerApprovedEmail(
        seller.email,
        seller.contactPerson || seller.businessName || 'Seller',
      );
    }

    return {
      message: SELLER_MESSAGES.APPROVED,
      seller,
    };
  }

  @Patch('sellers/:id/reject')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiParam({ name: 'id', description: 'Seller user id' })
  @ApiOperation({ summary: 'Admin: reject seller account' })
  async rejectSeller(
    @Param('id') id: string,
    @Body() dto: RejectSellerDto,
  ) {
    const seller = await this.usersService.rejectSeller(id, dto.rejectionReason);
    return {
      message: SELLER_MESSAGES.REJECTED,
      seller,
    };
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiParam({ name: 'id', description: 'User id' })
  @ApiOperation({ summary: 'Admin: get user by id' })
  findOne(@Param('id') id: string) {
    return this.usersService.getByIdOrFail(id);
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiParam({ name: 'id', description: 'User id' })
  @ApiOperation({ summary: 'Admin: activate/deactivate user' })
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateUserStatusDto,
  ) {
    return this.usersService.updateActiveStatus(id, dto.isActive);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiParam({ name: 'id', description: 'User id' })
  @ApiOperation({ summary: 'Admin: delete user' })
  async deleteUser(@Param('id') id: string, @CurrentUser() authUser: AuthUser) {
    if (authUser.userId === id) {
      throw new BadRequestException('You cannot delete your own account');
    }
    await this.usersService.deleteUser(id);
  }
}
