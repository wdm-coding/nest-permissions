import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { utilities, WinstonModule } from 'nest-winston'
import * as winston from 'winston'
import { LogConfig } from '../enum/log.enum'
import { LogsService } from './logs.service'
import { LogsController } from './logs.controller'
import * as DailyRotateFile from 'winston-daily-rotate-file'
import { Users } from '../entities/users/users.entity'
import { Logs } from 'src/entities/logs/logs.entity'
import { TypeOrmModule } from '@nestjs/typeorm'
const consoleConfig = () =>
  new winston.transports.Console({
    level: 'info', // 日志等级
    format: winston.format.combine(
      winston.format.timestamp(), // 添加时间戳
      winston.format.json(), // 添加 json 格式
      // 设置 nestLike 格式，此处设置为 NestJs-Log 应用名称
      utilities.format.nestLike('NestJs-Log', {
        colors: true, // 开启彩色输出
        prettyPrint: true, // 开启美化输出
        processId: true, // 开启进程 ID
        appName: true // 开启应用名称
      })
    )
  })
const warnDailyRotateFileConfig = (configService: ConfigService) =>
  new DailyRotateFile({
    level: configService.get(LogConfig.LOG_LEVEL), // 设置日志级别，此处设置为 info 及以上级别的日志才会输出到文件
    dirname: 'logs/winston-log', // 设置日志文件目录，此处设置为 logs 文件夹下的 winston-log 子文件夹
    filename: `${configService.get(LogConfig.LOG_LEVEL)}-%DATE%.log`, // 设置日志文件名，此处设置为当前日期.log
    datePattern: 'YYYY-MM-DD-HH', // 设置日志文件日期格式，此处设置为 YYYY-MM-DD
    zippedArchive: true, // 设置日志文件是否压缩，此处设置为压缩
    maxSize: '20m', // 设置日志文件最大大小，此处设置为 20MB
    maxFiles: '14d', // 设置日志文件最大数量，此处设置为 14 天
    format: winston.format.combine(
      winston.format.timestamp(), // 添加时间戳
      winston.format.simple() // 添加简单格式
    )
  })
const infoDailyRotateFileConfig = () =>
  new DailyRotateFile({
    level: 'info', // 设置日志级别，此处设置为 info 及以上级别的日志才会输出到文件
    dirname: 'logs/winston-log', // 设置日志文件目录，此处设置为 logs 文件夹下的 winston-log 子文件夹
    filename: `info-%DATE%.log`, // 设置日志文件名，此处设置为当前日期.log
    datePattern: 'YYYY-MM-DD-HH', // 设置日志文件日期格式，此处设置为 YYYY-MM-DD
    zippedArchive: true, // 设置日志文件是否压缩，此处设置为压缩
    maxSize: '20m', // 设置日志文件最大大小，此处设置为 20MB
    maxFiles: '14d', // 设置日志文件最大数量，此处设置为 14 天
    format: winston.format.combine(
      winston.format.timestamp(), // 添加时间戳
      winston.format.simple() // 添加简单格式
    )
  })

@Module({
  imports: [
    WinstonModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        // 自定义提供器
        transports: [
          // Console输出
          consoleConfig(),
          // warn文件输出
          warnDailyRotateFileConfig(configService),
          // info文件输出
          infoDailyRotateFileConfig()
        ]
      })
    }),
    // 引入其他模块
    TypeOrmModule.forFeature([Users, Logs])
  ],
  providers: [LogsService],
  controllers: [LogsController]
})
export class LogsModule {}
