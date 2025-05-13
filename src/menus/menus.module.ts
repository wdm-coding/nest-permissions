import { Module } from '@nestjs/common'
import { MenusService } from './menus.service'
import { MenusController } from './menus.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Menus } from '../entities/menus/menus.entity'
import { UserModule } from 'src/user/user.module'

@Module({
  imports: [TypeOrmModule.forFeature([Menus]), UserModule],
  controllers: [MenusController],
  providers: [MenusService]
})
export class MenusModule {}
