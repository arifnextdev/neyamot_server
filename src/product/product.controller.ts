// src/modules/product/product.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UsePipes,
} from '@nestjs/common';
import {
  CreateProductDto,
  CreateProductSchema,
  UpdateProductDto,
} from './common/dto';
import { getProductDto } from './common/dto/product.dto';
import { ZodValidationPipe } from './common/zodValidationPipe';
import { ProductService } from './product.service';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  findAll(@Query() query: getProductDto) {
    return this.productService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productService.findById(id);
  }

  @Post()
  @UsePipes(new ZodValidationPipe(CreateProductSchema))
  create(@Body() dto: CreateProductDto) {
    return this.productService.createProduct(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productService.updateProduct(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productService.deleteProduct(id);
  }
}
