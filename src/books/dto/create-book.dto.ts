import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateBookDto {
  @ApiProperty({ example: '978-3-16-148410-0', description: 'Unique ISBN of the book' })
  @IsString()
  @IsNotEmpty()
  isbn: string;

  @ApiProperty({ example: 'The Pragmatic Programmer', description: 'Title of the book' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'David Thomas, Andrew Hunt', description: 'Author(s) of the book' })
  @IsString()
  @IsNotEmpty()
  author: string;

  @ApiPropertyOptional({ example: 'Addison-Wesley Professional' })
  @IsOptional()
  @IsString()
  publisher?: string;

  @ApiPropertyOptional({ example: 'An excellent book for software engineering masterclass.' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c' })
  @IsOptional()
  @IsString()
  coverImage?: string;

  @ApiPropertyOptional({ example: ['Programming', 'Best Seller', 'Recommended'], description: 'Storefront category tags' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categories?: string[];

  @ApiPropertyOptional({ example: 352 })
  @IsOptional()
  @IsInt()
  @Min(1)
  pageCount?: number;

  @ApiPropertyOptional({ example: '2019-09-13' })
  @IsOptional()
  @IsString()
  publishedDate?: string;

  @ApiPropertyOptional({ example: 'English' })
  @IsOptional()
  @IsString()
  language?: string;
}
