import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { BooksService } from './books.service';
import { CreateBookDto, QueryBooksDto, UpdateBookStatusDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '../common/enums';
import { AuthUser } from '../common/interfaces';

@ApiTags('books')
@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SELLER, UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Create a new book (Sellers -> Pending, Admins -> Approved)' })
  @ApiBody({ type: CreateBookDto })
  async create(
    @Body() createBookDto: CreateBookDto,
    @CurrentUser() authUser: AuthUser,
  ) {
    if (authUser.role === UserRole.ADMIN) {
      return this.booksService.createByAdmin(createBookDto);
    }
    return this.booksService.createBySeller(createBookDto, authUser.userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all books as an array (Compatible with JSON Server frontend)' })
  async findAll(@Query() query: QueryBooksDto) {
    return this.booksService.findAllAsArray(query, false);
  }

  @Get('paginated')
  @ApiOperation({ summary: 'Get books with pagination metadata' })
  async findPaginated(@Query() query: QueryBooksDto) {
    return this.booksService.findPaginated(query);
  }

  @Get(':id')
  @ApiParam({ name: 'id', description: 'Book ID' })
  @ApiOperation({ summary: 'Get a single book by ID' })
  async findOne(@Param('id') id: string) {
    return this.booksService.findOneOrFail(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiParam({ name: 'id', description: 'Book ID' })
  @ApiOperation({ summary: 'Admin: Approve or reject a book submission' })
  @ApiBody({ type: UpdateBookStatusDto })
  async updateStatus(
    @Param('id') id: string,
    @Body() updateBookStatusDto: UpdateBookStatusDto,
  ) {
    return this.booksService.updateStatus(id, updateBookStatusDto.status);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiParam({ name: 'id', description: 'Book ID' })
  @ApiOperation({ summary: 'Admin: Delete a book' })
  async delete(@Param('id') id: string) {
    await this.booksService.deleteBook(id);
  }
}
