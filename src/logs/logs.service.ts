import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Logs } from 'src/entities/logs/logs.entity'
import { Users } from 'src/entities/users/users.entity'
import { Repository } from 'typeorm'
@Injectable()
export class LogsService {
  constructor(
    @InjectRepository(Logs)
    private readonly logsRepository: Repository<Logs>,
    @InjectRepository(Users)
    private readonly userRepository: Repository<Users>
  ) {}

  // 根据用户ID查询日志列表
  async findUserLogs(id: number) {
    const user = await this.userRepository.findOne({ where: { id } })
    return this.logsRepository.find({
      relations: {
        users: false
      },
      where: { users: user as Users }
    })
  }

  // 日志高级查询
  async findLogsByGroup(id: number) {
    // 查询logs 的 result 字段分组统计
    return this.logsRepository
      .createQueryBuilder('logs') // 创建查询构建器，指定别名logs
      .select(['logs.result as result', 'COUNT(logs.result) as count']) // 指定查询的字段和别名
      .leftJoinAndSelect('logs.users', 'user') // 左连接users表，并选择相关字段
      .where('user.id = :id', { id: id }) // 添加查询条件，指定用户ID
      .groupBy('logs.result') // 根据logs.result字段分组统计
      .orderBy('count', 'DESC') // 根据统计结果降序排序
      .addOrderBy('result', 'DESC') // 根据日志结果升序排序
      .offset(1) // 设置查询偏移量，用于分页查询-pageNumber
      .limit(3) // 限制查询结果数量为10条 -pageSize
      .getRawMany() // 执行查询并返回原始结果集
  }
}
