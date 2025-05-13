import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  ParseIntPipe
} from '@nestjs/common'
import { MenusService } from './menus.service'
import { CreateMenuDto, UpdateMenuDto } from './dto/menus.dto'
import { TypeormDecorator } from '../decotator/typeorm.decotator'
import { JwtGuard } from '../guards/jwt.guard'
import { ResponseInterceptor } from '../interceptors/response.interceptor'
import { SerializeInterceptor } from '../interceptors/serialize.interceptor'

@Controller('menus')
@TypeormDecorator()
@UseGuards(JwtGuard)
@UseInterceptors(new ResponseInterceptor())
export class MenusController {
  constructor(private readonly menusService: MenusService) {}
  // 查询所有菜单列表
  @Get('list')
  findAll() {
    return this.menusService.findAll()
  }
  // 添加菜单
  @Post('add')
  @UseInterceptors(new SerializeInterceptor(CreateMenuDto))
  create(@Body() createMenuDto: CreateMenuDto) {
    return this.menusService.create(createMenuDto)
  }
  // 根据id查询菜单详情
  @Get('getById:id')
  findOne(@Param('id') id: string) {
    return this.menusService.findOne(+id)
  }
  // 更新菜单信息
  @Patch('edit/:id')
  @UseInterceptors(new SerializeInterceptor(CreateMenuDto))
  update(@Param('id') id: string, @Body() updateMenuDto: UpdateMenuDto) {
    return this.menusService.update(+id, updateMenuDto)
  }
  // 删除菜单信息
  @Delete('delete/:id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.menusService.remove(id)
    return { id }
  }
}
