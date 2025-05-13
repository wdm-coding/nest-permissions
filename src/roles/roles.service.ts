import { HttpException, Injectable } from '@nestjs/common'
import { CreateRoleDto, UpdateRoleDto } from './dto/role.dto'
import { InjectRepository } from '@nestjs/typeorm'
import { Roles } from '../entities/roles/roles.entity'
import { Repository } from 'typeorm'

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Roles)
    private rolesRepository: Repository<Roles>
  ) {}
  // 查询所有角色的方法
  findAll() {
    return this.rolesRepository.find()
  }
  // 创建角色的方法
  create(createRoleDto: CreateRoleDto) {
    const role = this.rolesRepository.create(createRoleDto)
    return this.rolesRepository.save(role)
  }
  // 查询单个角色的方法
  findOne(id: number) {
    return this.rolesRepository.findOne({
      where: { id }
    })
  }
  // 更新角色的方法
  async update(id: number, updateRoleDto: UpdateRoleDto) {
    const role = await this.findOne(id)
    if (!role) throw new HttpException('角色不存在', 200)
    const newRole = this.rolesRepository.merge(role, updateRoleDto)
    return this.rolesRepository.save(newRole)
  }
  // 删除角色的方法
  remove(id: number) {
    return this.rolesRepository.delete(id)
  }
}
