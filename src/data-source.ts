import { DataSource, DataSourceOptions } from 'typeorm'
const dataSource = new DataSource({
  type: 'mysql', // 数据库类型
  host: '127.0.0.1', // 数据库主机
  port: 3306, // 数据库端口
  username: 'root', // 数据库用户名
  password: '123456', // 数据库密码
  database: 'nest-test-db', // 数据库名称
  entities: ['src/**/*.entity.ts'], // 数据库实体
  synchronize: true, // 是否自动同步数据库架构
  logging: false, // 是否记录日志
  migrations: ['src/migrations/*.ts']
} as DataSourceOptions)

export default dataSource
