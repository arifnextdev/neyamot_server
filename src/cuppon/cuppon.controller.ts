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
import { CupponService } from './cuppon.service';
import { ZodValidationPipe } from 'src/product/common/zodValidationPipe';
import { createCupponDto, CreateCupponSchema } from './dto/create.cuppon.dto';
import { updateCupponDto } from './dto/update.cuppon.dto';

@Controller('cuppons')
export class CupponController {
  constructor(private readonly cupponService: CupponService) {}

  @Get()
  getCuppons(@Query() query: any) {
    return this.cupponService.getCuppons(query);
  }

  @Post()
  @UsePipes(new ZodValidationPipe(CreateCupponSchema))
  createCuppon(@Body() data: createCupponDto) {
    // console.log(data);
    return this.cupponService.createCuppon(data);
  }

  // @UsePipes(new ZodValidationPipe(updateCupponSchema))
  @Put(':id')
  updateCuppon(@Param('id') id: string, @Body() data: updateCupponDto) {
    console.log(data);
    return this.cupponService.updateCuppon(id, data);
  }

  @Delete(':id')
  deleteCuppon(@Param('id') id: string) {
    return this.cupponService.deleteCuppon(id);
  }
}
