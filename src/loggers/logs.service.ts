import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Logs } from '../entities/logs/logs.entity'
import { Repository } from 'typeorm'
@Injectable()
export class LogsService {
  constructor(
    @InjectRepository(Logs)
    private readonly logsRepository: Repository<Logs>
  ) {}
  // 查询日志列表
  async findAll() {
    return this.logsRepository.find()
  }
}
