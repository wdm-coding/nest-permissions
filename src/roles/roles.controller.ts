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
import { RolesService } from './roles.service'
import { CreateRoleDto, UpdateRoleDto } from './dto/role.dto'
import { TypeormDecorator } from '../decotator/typeorm.decotator'
import { JwtGuard } from '../guards/jwt.guard'
import { ResponseInterceptor } from '../interceptors/response.interceptor'
import { SerializeInterceptor } from '../interceptors/serialize.interceptor'

@Controller('roles')
@TypeormDecorator()
@UseGuards(JwtGuard)
@UseInterceptors(new ResponseInterceptor())
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}
  // 查询所有角色的方法
  @Get('list')
  findAll() {
    return this.rolesService.findAll()
  }
  // 创建角色的方法
  @Post('add')
  @UseInterceptors(new SerializeInterceptor(CreateRoleDto))
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.rolesService.create(createRoleDto)
  }
  // 查询单个角色的方法
  @Get('getRoleById/:id')
  findOne(@Param('id') id: string) {
    return this.rolesService.findOne(+id)
  }
  // 更新角色的方法
  @Patch('edit/:id')
  @UseInterceptors(new SerializeInterceptor(UpdateRoleDto))
  update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return this.rolesService.update(+id, updateRoleDto)
  }
  // 删除角色的方法
  @Delete('delete/:id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.rolesService.remove(id)
    return { id }
  }
}
