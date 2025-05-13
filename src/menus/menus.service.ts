import { HttpException, Injectable } from '@nestjs/common'
import { CreateMenuDto, UpdateMenuDto } from './dto/menus.dto'
import { InjectRepository } from '@nestjs/typeorm'
import { Menus } from '../entities/menus/menus.entity'
import { Repository } from 'typeorm'

@Injectable()
export class MenusService {
  constructor(
    @InjectRepository(Menus)
    private menusRepository: Repository<Menus>
  ) {}
  // 查询所有菜单
  findAll() {
    return this.menusRepository.find()
  }
  // 创建菜单
  create(createMenuDto: CreateMenuDto) {
    const menu = this.menusRepository.create(createMenuDto)
    return this.menusRepository.save(menu)
  }
  // 根据id查询菜单
  findOne(id: number) {
    return this.menusRepository.findOne({
      where: { id }
    })
  }
  // 更新菜单
  async update(id: number, updateMenuDto: UpdateMenuDto) {
    const menu = await this.findOne(id)
    if (!menu) throw new HttpException('菜单不存在', 200)
    const newRole = this.menusRepository.merge(menu, updateMenuDto)
    return this.menusRepository.save(newRole)
  }
  // 删除菜单
  remove(id: number) {
    return this.menusRepository.delete(id)
  }
}
