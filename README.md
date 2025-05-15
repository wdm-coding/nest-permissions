# 从0开始搭建nest项目初始化框架

## 1. 全局安装nest-cli工具包 npm i -g @nestjs/cli

## 2. 创建项目 nest new nest-project

## 3. 进入项目目录下载依赖包 npm install (node版本需要20.1.0以上版本)

## 4. 添加.prettierrc配置文件,配置prettier规则

## 5. 添加eslintrc.js或者eslint.config.mjs配置文件,配置prettier规则

## 6. 环境变量配置
:::tip 环境变量配置
1. 创建环境变量枚举文件`src/enum/env.enum.ts`,枚举环境变量配置
2. 安装cross-env控制环境变量 npm i cross-env
3. 在package.json中配置环境变量运行脚本
```json
"scripts": {
  "start:dev": "cross-env NODE_ENV=development nest start --watch",
  "start:prod": "cross-env NODE_ENV=production nest start --watch",
  "build:dev": "cross-env NODE_ENV=development nest build",
  "build:prod": "cross-env NODE_ENV=production nest build",
}
```

4. 安装nestjs-config配置模块作为环境配置方案 npm i --save @nestjs/config
5. 在项目根目录下创建`.env`文件,配置默认环境变量信息
6. 在项目根目录下创建`.env.development`文件,配置开发环境变量信息
7. 在项目根目录下创建`.env.production`文件,配置生产环境变量信息
8. 下载joi依赖包用于环境变量校验`npm i --save joi`
9. 在app.module.ts文件中引入ConfigModule配置模块,并使用ConfigModule.forRoot()方法加载环境变量文件

```ts
ConfigModule.forRoot({
  isGlobal: true, // 全局配置
  envFilePath: [`.env.${process.env.NODE_ENV}`, '.env'], // 如果在多个文件中找到某个变量，则第一个变量优先。
  validationSchema: Joi.object({ // 校验
    NODE_ENV: Joi.string()
      .valid('development', 'production')
      .default('development'),
    PORT: Joi.number().default(3000),
    DB_TYPE: Joi.string().valid('mysql', 'postgres').required(),
    DB_HOST: Joi.string().required(),
    DB_PORT: Joi.number().required(),
    DB_USERNAME: Joi.string().required(),
    DB_PASSWORD: Joi.string().required(),
    DB_DATABASE: Joi.string().required()
  })
})
```
:::

## 7. 配置Docker-compose文件
:::tip Docker-compose文件配置
1. 项目根目录下创建`docker-compose.yml`文件,配置Docker容器信息
2. 在项目根目录下执行命令`docker-compose up -d`,启动服务
:::

## 8. 配置数据库连接
1. 在项目根目录下创建`ormconfig.ts`文件，配置数据库连接信息
```ts
import { TypeOrmModuleOptions } from '@nestjs/typeorm'
import { DataSource, DataSourceOptions } from 'typeorm'
import * as fs from 'fs'
import * as dotenv from 'dotenv'
import { EnvConfig } from 'src/enum/env.enum'
// 1. 通过环境变量读取不同的.env文件
function getEnv(env: string): Record<string, unknown> {
  // 检查环境变量文件是否存在
  if (fs.existsSync(env)) {
    // 如果文件存在，则读取文件内容并解析
    return dotenv.parse(fs.readFileSync(env))
  }
  // 如果文件不存在，返回一个空对象
  return {}
}

// 2. 批量导入entities实体文件
const entitiesDir = [__dirname + '/src/entities/**/*.entity{.ts,.js}']

// 3. 通过dotENV来解析不同的配置文件
function buildConnectionOptions() {
  const defaultConfig = getEnv(`.env`) // 从默认环境配置文件读取配置
  const envConfig = getEnv(`.env.${process.env.NODE_ENV}`) // 根据当前环境变量读取相应的环境配置文件
  const config = { ...defaultConfig, ...envConfig } // 合并默认配置和环境配置
  return {
    type: config[EnvConfig.DB_TYPE], // 数据库类型
    host: config[EnvConfig.DB_HOST], // 数据库主机
    port: config[EnvConfig.DB_PORT], // 数据库端口
    username: config[EnvConfig.DB_USERNAME], // 数据库用户名
    password: config[EnvConfig.DB_PASSWORD], // 数据库密码
    database: config[EnvConfig.DB_DATABASE], // 数据库名称
    entities: entitiesDir, // 数据库实体
    synchronize: true, // 是否自动同步数据库架构
    logging: false // 是否记录日志
  } as TypeOrmModuleOptions
}

// 3. 导出配置文件
export const typeOrmConfig = buildConnectionOptions()
// 4. 导出数据源配置文件
export default new DataSource({
  ...typeOrmConfig,
  migrations: ['src/migrations/**'], // 迁移文件路径
  subscribers: [] // 订阅者文件路径
} as DataSourceOptions)
```

2. 在`app.module.ts`中配置TypeORM
```ts
import { typeOrmConfig } from '../ormconfig'
@Module({
  imports:[
    TypeOrmModule.forRoot(typeOrmConfig),
  ]
})
```

## 9. 创建数据库实体类
1. 在`src/entities`目录下创建数据库实体类文件，例如：`user.entity.ts`
2. 在`app.module.ts`文件中引入实体类，并注册到TypeOrmModule中entities数组中

## 10. 创建控制器和业务逻辑层
1. 在`src/user`目录下创建控制器文件，例如：`user.controller.ts`
2. 在`src/user`目录下创建业务逻辑层文件，例如：`user.service.ts`
3. 在`src/user`目录下创建模块文件，例如：`user.module.ts`
4. 在`app.module.ts`文件中引入控制器和业务逻辑层，并注册到@Module装饰器的controllers数组中和providers数组中
```ts
import { UserModule } from './user/user.module'
@Module({
  imports: [
    // 环境变量配置模块 读取当前环境的配置信息
    // 数据库模块 读取当前环境的数据库连接信息
    // 业务模块...
    UserModule
  ],
  controllers: [],
  providers: []
})
export class AppModule {}
```

## 11. 第三方日志模块winston配置

### 1. 下载依赖

```bash
$ npm install --save nest-winston winston
```

### 2. winston滚动日志 `winston-daily-rotate-file`

```bash
$ npm install --save winston-daily-rotate-file
```

### 3. 日志`modules`创建

1.  nest cli 创建模块`logs`
```bash
$ nest g module logs
```

2. 在`src/enum/log.enum.ts`文件中配置日志枚举
```ts
export enum LogConfig {
  LOG_LEVEL = 'LOG_LEVEL',
  LOG_ON = 'LOG_ON'
}
```

3. 在.env文件中配置日志变量
```bash
LOG_LEVEL=info
LOG_ON=true
```

4. 在`logs.module.ts`文件中配置日志
```ts
import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { utilities, WinstonModule } from 'nest-winston'
import * as winston from 'winston'
import { LogConfig } from '../enum/log.enum'
import * as DailyRotateFile from 'winston-daily-rotate-file'
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
    })
  ]
})
export class LogsModule {}
```

### 4. 全局HTTP异常捕获过滤器

1. 下载获取用户IP地址的库`request-ip`
```bash
$ npm install request-ip --save
```

2. 在`src/filters/all-exception.filter.ts`文件中创建异常过滤器
```ts
// 全局所有异常捕获过滤器
import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, LoggerService } from '@nestjs/common'
import { HttpAdapterHost } from '@nestjs/core' // 导入http适配器宿主服务
import * as requestIp from 'request-ip' // 获取用户IP
@Catch() // 捕获所有异常
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(
    private readonly httpAdapterHost: HttpAdapterHost, // http适配器宿主
    private logger: LoggerService
  ) {}
  catch(exception: any, host: ArgumentsHost) {
    const { httpAdapter } = this.httpAdapterHost // 获取http适配器
    const ctx = host.switchToHttp() // 切换到http上下文
    const response = ctx.getResponse<Response>() // 获取响应对象
    const request = ctx.getRequest<Request>() // 获取请求对象
    const httpStatus = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR // 获取http状态码
    // 响应体数据
    const responseBody = {
      headers: request.headers, // 请求头
      body: request.body, // 请求体
      timestamp: new Date().toISOString(), // 时间戳
      ip: requestIp.getClientIp(request), // 用户IP
      message: exception.message, // 异常信息
      exception: exception.name, // 异常名称
      status: httpStatus, // 状态码
      error: exception.response || '未知错误' // 错误信息
    }
    this.logger.error('捕获异常: ', responseBody) // 打印日志信息
    httpAdapter.reply(response, responseBody, httpStatus) // 返回响应信息
  }
}
```

### 5. 在`main.ts`中全局注册日志模块与异常过滤器 
```ts
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston'
// 1. 全局注册日志
app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER)) 
// 2. 全局注册异常过滤器
app.useGlobalFilters(new AllExceptionsFilter(httpAdapter, app.get(WINSTON_MODULE_NEST_PROVIDER))) 
```

### 6. 在控制器中使用日志
```ts
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston' 
import { Inject,LoggerService } from '@nestjs/common'
constructor(
  private userService: UserService,
  @Inject(WINSTON_MODULE_NEST_PROVIDER)
  private logger: LoggerService
) {
  this.logger.log('log-日志测试')
}
```

## 12. API开发

### 分页条件查询，查询条件为空时不查询，不为空时查询。需要动态构建查询条件对象
1. 在`utils/db.helper.ts`文件中创建查询工具类
```ts
// 1. unils文件中封装动态条件对象构建函数db.helper.ts
import { ObjectLiteral, SelectQueryBuilder } from 'typeorm'
export const conditionUtils = <T extends ObjectLiteral>(
  queryBuilder: SelectQueryBuilder<T>,
  record: Record<string, unknown>
) => {
  Object.keys(record).forEach(key => {
    if (record[key]) {
      queryBuilder.andWhere(`${key} = :${key}`, { [key]: record[key] })
    }
  })
  return queryBuilder
}
```
2. 调用封装好的函数
```ts
async findAll(query: UserQuery) {
  const { username, roleId, gender, pageNum, pageSize } = query
  // 分页参数，默认为第一页每页10条数据
  const take = Number(pageSize) || 10 // 每页显示多少条数据
  const skip = (Number(pageNum || 1) - 1) * take // 跳过多少条数据
  // 1. 关联查询
  const queryBuilder = this.userRepository
    .createQueryBuilder('users')
    .leftJoinAndSelect('users.profile', 'profile')
    .leftJoinAndSelect('users.roles', 'roles')
    // 2. 动态查询条件，如果条件为空则不添加该条件。(第一个查询条件为1=1，后续的条件为AND条件)
    .where(username ? 'users.username LIKE :username' : '1=1', username ? { username: `%${username}%` } : {})
  const searchList = {
    'roles.id': roleId,
    'profile.gender': gender
  }
  const list = conditionUtils<Users>(queryBuilder, searchList)
  const total = await list.getCount() // 总条数
  const result = await list.skip(skip).take(take).getMany()
  // getRawMany()不直接支持分页，因为它只是执行原始SQL查询。
  return {
    pageSize: take, // 每页显示多少条数据
    pageNum: Number(pageNum || 1), // 当前页码
    total, // 总条数
    list: result.map(item => ({
      userId: item.id,
      password: '',
      address: item.profile?.address,
      gender: item.profile?.gender,
      phone: item.profile?.phone,
      username: item.username,
      roleName: item.roles.map(role => role.name).join(','),
      roleIds: item.roles.map(role => role.id).join(',')
    }))
  }
}
```

### 创建typeorm的异常过滤器
1. 在filters目录下创建typeorm.filter.ts文件
```bash
$ nest g f filters/typeorm --flat --no-spec
```
2. 编写typeorm异常过滤器
```ts
import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common'
import { QueryFailedError, TypeORMError } from 'typeorm'
@Catch(TypeORMError)
export class TypeormFilter implements ExceptionFilter {
  catch(exception: TypeORMError, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse()
    let msg = exception.message
    if (exception instanceof QueryFailedError) {
      const errno = exception.driverError?.errno || null
      switch (errno) {
        case 1062: // 唯一约束冲突
          msg = `字段重复，请检查数据是否已存在`
          break
        default:
          msg = exception.message || '数据库查询异常'
          break
      }
    }
    response.status(500).json({
      code: -1,
      msg,
      data: null
    })
  }
}
```

## 14. 管道
### nestjs内置全局管道注册

```ts
import { ValidationPipe } from '@nestjs/common'
app.useGlobalPipes(new ValidationPipe())
```

### 创建管道
1. 安装class-validator和class-transformer
+ class-validator 用于验证数据，class-transformer 用于转换数据。

```bash
$ npm install class-validator class-transformer --save
```

2. 使用`class-validator`创建校验规则,在`src/user/dto`目录下创建`user-dto.ts`文件
```ts
import { IsNotEmpty, IsNumber, IsPhoneNumber, IsString, Length } from 'class-validator'
export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @Length(6, 20, {
    // $value: 'admin', // 当前传入的值
    // $property: 'username', // 属性名
    // $target: SigninUserDto, // 类本身
    // $constraint1: 6, // 最小的长度
    // $constraint2: 20, // 最大的长度
    message: '用户名长度必须在6到20之间'
  })
  username: string
  @IsString()
  @IsNotEmpty()
  @Length(6, 20, {
    message: '密码长度必须在6到20之间'
  })
  password: string
  @IsNumber()
  gender: number
  @IsString()
  phone: string
  @IsString()
  address: string
  @IsString()
  roleIds: string
}
```
3. 在`src/user/pipes`目录下创建`userPipe.ts`文件实现自定义管道
```ts
import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common'
import { CreateUserDto } from '../dto/create-user.dto'
@Injectable()
export class CreatUserPipe implements PipeTransform {
  transform(value: CreateUserDto, metadata: ArgumentMetadata) {
    // 这里可以对value进行校验，校验不通过抛出异常
    return value
  }
}
```

4. 在`src/user/user.controller.ts`中使用自定义管道和DTO

```ts
// 添加用户
@Post('add')
async addUser(@Body(CreatUserPipe) dto: CreateUserDto): Promise<any> {
  console.log('dto', dto)
  const result = await this.userService.create(dto)
  return {
    code: 0,
    msg: 'success',
    data: result
  }
}
```
5. 在`src/user/user.controller.ts`中使用单个变量校验
+ ParseIntPipe 用于将字符串转换为数字，如果转换失败会抛出异常。
```ts
// 根据id查询用户
@Get('getUserById/:id')
getUserById(@Query('id', ParseIntPipe) id: any): Promise<any> {
  return this.userService.findOne(id)
}
```

## 15. JWT认证

### 安装依赖
+ @nestjs/jwt 模块提供了JWT认证的支持。
+ @nestjs/passport 模块提供了Passport的支持，用于实现OAuth2.0、JWT等认证方式。
+ passport 是一个Node.js中间件，用于实现身份验证。
+ passport-jwt 是一个Passport的JWT策略，用于实现JWT认证。
```bash
$ npm install @nestjs/jwt @nestjs/passport passport passport-jwt --save
```

### 创建Auth模块

1. 生成Auth模块
```bash
$ nest g module auth --no-spec
$ nest g controller auth --no-spec
$ nest g service auth --no-spec
```
2. 创建`auth/auth.strategy.ts`策略文件
```ts
import { ExtractJwt, Strategy } from 'passport-jwt'
import { PassportStrategy } from '@nestjs/passport'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { EnvConfig } from '../enum/env.enum'
@Injectable()
// 扩展passport-jwt的策略类，用于验证token是否有效
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(protected configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // 从请求头中提取token
      ignoreExpiration: false, // 忽略过期时间
      secretOrKey: configService.get(EnvConfig.JWT_SECRET) // 密钥
    })
  }
  validate(payload: any) {
    // 这里可以添加一些验证逻辑，比如检查用户是否存在等
    return payload
  }
}
```

3. 在`auth.module.ts`中导入`JwtModule、PassportModule、JwtStrategy`
```ts
import { Module } from '@nestjs/common'
import { PassportModule } from '@nestjs/passport'
import { JwtModule } from '@nestjs/jwt'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { UserModule } from '../user/user.module'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { EnvConfig } from '../enum/env.enum'
import { JwtStrategy } from './auth.strategy'
@Module({
  imports: [
    UserModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        return {
          secret: configService.get(EnvConfig.JWT_SECRET), // 密钥
          signOptions: {
            expiresIn: '1d' // 过期时间 1天
          }
        }
      },
      inject: [ConfigService] // 注入配置服务
    })
  ],
  providers: [AuthService, JwtStrategy], // 注入策略服务
  controllers: [AuthController]
})
export class AuthModule {}
```

4. 在`auth.service.ts`中实现登录接口，通过@nestjs/jwt的jwtService生成token
```ts
import { JwtService } from '@nestjs/jwt'
constructor(
  private readonly userService: UserService,
  private readonly jwtService: JwtService
) {}
// 登录用户信息
async signIn(username: string, password: string) {
  const user = await this.userService.findOneByName(username)
  if (!user) throw new ForbiddenException('用户名不存在')
  // 用户密码校验
  const isPasswordValid = await argon2.verify(user.password, password)
  if (!isPasswordValid) throw new UnauthorizedException('用户名或密码错误')
  // 生成JWT
  const result = await this.jwtService.signAsync({
    username,
    sub: user.id
  })
  return result
}
```

5. 在`auth.controller.ts`中实现登录接口
```ts
constructor(private authService: AuthService) {}
@Post('signin') // 登录
async signIn(@Body() dto: SigninUserDto) {
  const { username, password } = dto
  const token = await this.authService.signIn(username, password)
  return {
    code: 0,
    message: '登录成功',
    data: token
  }
}
```

6. 在`src/guards/jwt.guard.ts`中实现JWT守卫
```ts
import { AuthGuard } from '@nestjs/passport'
export class JwtGuard extends AuthGuard('jwt') {
  constructor() {
    super()
  }
}
```
7. 在`src/guards/admin.guard.ts`中实现admin角色权限守卫
```ts
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { UserService } from '../user/user.service'
import { Users } from '../entities/users/users.entity'

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private userService: UserService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 1. 获取请求对象
    const req = context.switchToHttp().getRequest()
    // 2. 获取请求头中的token, 解析token, 获取其中的用户信息, 判断用户是否为拥有角色权限
    const user = (await this.userService.findOneByName(req.headers['username'])) as Users
    if (user.roles.find(role => role.code === 'admin')) {
      // 如果用户是管理员，则返回true，否则返回false。
      return true
    } else {
      return false
    }
  }
}
```
8. 在任意模块中`module.ts`全局使用JWT守卫
```ts
import { APP_GUARD } from '@nestjs/core'
import { JwtGuard } from './guards/jwt.guard'
@Module({
  imports: [],
  controllers: []
  providers: [{
    provide: APP_GUARD,
    useClass: JwtGuard,
  }], // 注入全局守卫
  exports: []
})
```
9. 在局部接口中使用守卫
```ts
// 在控制器顶部使用jwt守卫
@UseGuards(AdminGuard) // 使用管理员权限守卫
// 在需要角色权限的接口上使用admin守卫
@Get('list')
@UseGuards(AdminGuard)
async getAllUsers(@Query() query: UserQuery): Promise<any> {
  const result = await this.userService.findAll(query)
  return {
    code: 0,
    msg: 'success',
    data: result
  }
}
```

## 16. argon2密码加密
1. 安装argon2库
```bash
npm install argon2
```
2. 创建账号时使用argon2加密密码
```ts
import * as argon2 from 'argon2'
const hashPassword = await argon2.hash(password)
```
3. 登录时使用argon2验证密码
```ts
const isPasswordValid = await argon2.verify(user.password, password)
```

## 17. 拦截器

1. 创建拦截器`src/interceptors/serialize.interceptor.ts`
```ts
$ nest g interceptor interceptors/serialize --no-spec
```
2. 在拦截器中实现序列化逻辑
```ts
export class SerializeInterceptor implements NestInterceptor {
  constructor(private dto: any) {}
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest()
    console.log('拦截器执行之前')
    return next.handle().pipe(
      map(data => {
        console.log('拦截器执行之后')
        const result = plainToInstance(this.dto, data, {
          excludeExtraneousValues: true // 排除掉多余的值,必须设置Exporse或者Exclude
        })
        return result
      })
    )
  }
}
```
3. 将拦截器封装为一个装饰器`src/decotator/serialize.decorator.ts`
```ts
import { UseInterceptors } from '@nestjs/common'
import { SerializeInterceptor } from '../interceptors/serialize.interceptor'
interface ClassConstructor {
  new (...args: any[]): any
}
export function Serialize(dto: ClassConstructor) {
  return UseInterceptors(new SerializeInterceptor(dto))
}
```
4. 在控制器中使用拦截器装饰器`src/user/user.controller.ts`
```ts
@Serialize(UserDto)
async getAllUsers(@Query() query: UserQuery): Promise<any> {
  const result = await this.userService.findAll(query)
  return {
    code: 0,
    msg: 'success',
    data: result
  }
}
```

# 18. nest 权限控制模块

+ 前端权限控制：前端路由控制、按钮权限控制。
+ 后端权限控制：接口权限控制、数据权限控制。
+ RABC 即 Role-Based Access Control 基于角色的权限控制：角色拥有一定的权限，用户通过分配角色来获取相应的权限。
+ ACL 即 Access Control List 基于策略的权限控制：通过策略列表来定义用户可以访问的资源。
+ 混合模式：结合角色和策略的权限控制。

## 创建权限控制模块
1. nest创建roles增删改查模块
```bash
$ nest g resource roles --no-spec
# 选择REST 
```

2. nest创建menus增删改查模块
```bash
$ nest g resource menus --no-spec
# 选择REST 
```

3. 编辑menus的Entity文件
```ts
import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from 'typeorm'
import { Roles } from '../roles/roles.entity'
@Entity()
export class Menus {
  @PrimaryGeneratedColumn()
  id: number
  @Column()
  name: string
  @Column()
  path: string
  @Column()
  icon: string
  @Column()
  order: number
  @Column()
  acl: string
  // 多对多关系，一个菜单可以属于多个角色，一个角色可以拥有多个菜单。
  @ManyToMany(() => Roles, roles => roles.menus)
  @JoinTable({ name: 'role_menu' })
  roles: Roles[]
}
```

4. 编辑roles的Entity文件
```ts
@ManyToMany(() => Menus, menus => menus.roles) // 关系装饰器，告诉 TypeORM 这个属性是多对多关系。
menus: Menus[] // 菜单字段
```

## 通过 migration 更新数据库
1. migration:create 创建迁移文件
```bash
$ npm run migration:create src/migrations/init
```

2. 执行迁移文件，更新数据库
```bash
$ npm run migration:generate --name=menus
```

## 19. 方案一、RBAC权限控制模块(基于角色的权限控制)
1. 新建`role.enum.ts`文件，定义角色枚举
```ts
export enum Role {
  ADMIN = 'admin', // 管理员
  USER = 'user', // 用户
  GUEST = 'guest' // 游客
}
```

2. 新建`role.decorator.ts`文件，定义角色装饰器
```ts
import { SetMetadata } from '@nestjs/common'
import { Role } from '../enum/role.enum'
export const ROLES_KEY = 'roles'
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles)
```
::: tip SetMetadata使用
+ SetMetadata 是一个装饰器，用于设置元数据。在 NestJS 中，我们经常使用它来传递额外的信息给拦截器、守卫和过滤器等中间件组件。例如，我们可以利用 SetMetadata 来定义一个路由的权限角色，然后在相应的守卫中读取这个元数据，从而实现基于角色的访问控制。
角色装饰器是如何工作的？
1. 接受可变数量的 Role 参数，返回 SetMetadata 设置的元数据。
2. 实际使用中，@Roles(Role.Admin) 会将该路由的所需角色存储到元数据。
:::

3. 新建`role.guard.ts`文件，定义角色守卫
```ts
$ nest g gu guards/role --no-spec

import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { ROLES_KEY } from '../decotator/role.decorator'
import { Role } from '../enum/role.enum'
import { UserService } from '../user/user.service'

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    // 使用userService 必须在使用此守卫的模块中导入UserModel模块，否则会报错
    private userService: UserService
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // reflector 获取装饰器中的数据
    // getAllAndOverride 获取路由上的元数据，第一个参数是装饰器的key值，第二个参数是装饰器所在的类或者方法
    // getAllAndMerge 合并类和方法的元数据，第一个参数是装饰器的key值，第二个参数是装饰器所在的类或者方法
    const requestRole = this.reflector.getAllAndMerge<Role[]>(ROLES_KEY, [context.getHandler(), context.getClass()])
    if (!requestRole) return true
    // 获取当前请求的用户信息
    const req = context.switchToHttp().getRequest()
    // 查询用户信息
    const user = await this.userService.findOneByName(req.user.username)
    if (!user) throw new ForbiddenException('用户不存在')
    const roles = user.roles?.map(role => role.code)
    const flag = requestRole.some(role => roles?.includes(role))
    if (!flag) throw new ForbiddenException('无权限访问')
    return true
  }
}
```
4. 在controller中使用角色装饰器
```ts
// 查询所有菜单列表
@Get('list')
@Roles(Role.USER)
findAll() {
  return this.menusService.findAll()
}
```

::: tip RABC 权限管理的流程
1. 定义角色枚举
```js
{
  ADMIN = 'admin', // 管理员
  USER = 'user', // 用户
  GUEST = 'guest' // 游客
}
```
2. RoleGuard 负责根据获取装饰器中的数据，判断当前用户是否有对应的操作权限来进行守卫。
3. Roles装饰器 负责在控制器或者方法上定义权限规则。(@Roles(Role.Admin))
:::

## 20. 方案二、ACL权限控制模块(基于策略的权限控制)

1. 下载`casl-ability`包
```bash
$ npm install @casl/ability --save
```

2. 在auth模块下新建`casl-ability.service.ts`文件，定义权限工厂
```ts
import { ForbiddenException, Injectable } from '@nestjs/common'
import { AbilityBuilder, createMongoAbility } from '@casl/ability'
import { UserService } from '../user/user.service'
import getEntities from '../utils/getEntities'
@Injectable()
export class CaslAbilityService {
  constructor(private userService: UserService) {}
  async forRoot(username: string) {
    const { can, build } = new AbilityBuilder(createMongoAbility) // CASL 提供的工具，用于构建 Ability 对象。
    const user = await this.userService.findOneByName(username)
    if (!user) throw new ForbiddenException('用户不存在')
    user.roles.forEach(role => {
      role.menus.forEach(menu => {
        menu.acl.split(',').forEach(action => {
          can(action, getEntities(menu.path))
        })
      })
    })
    const ability = build({
      // 生成 Ability 对象 表示用户的权限 并传入配置对象，其中 detectSubjectType 是一个函数，用于确定主体类型。
      detectSubjectType: item => item.constructor.name
    })
    // 在守卫中使用 ability 对象来检查权限等操作。例如，在守卫中可以使用 can 方法来判断用户是否有执行某个操作的权限。
    return ability
  }
}
```
3. 在decotator目录下新建`casl.decorator.ts`文件，定义权限装饰器
```ts
import { SetMetadata } from '@nestjs/common'
import { AnyMongoAbility, InferSubjects } from '@casl/ability'
import { Action } from 'src/enum/action.enum'

export enum CHECK_POLICIES_KEY {
  HANDLER = 'CHECK_POLICIES_HANDLER', // 自定义的权限监察逻辑处理函数
  CAN = 'CHECK_POLICIES_CAN', // 表示用户被允许执行某个操作(ability.can)
  CANNOT = 'CHECK_POLICIES_CANNOT' // 表示用户不被允许执行某个操作(ability.cannot)
}
// 回调函数类型，接收一个 ability 对象（CASL 的权限对象），返回一个布尔值，表示权限检查的结果。
export type PolicyHandlerCallback = (ability: AnyMongoAbility) => boolean
// 自定义的权限检查逻辑处理函数类型，可以是单个回调函数或者一个回调函数的数组。
// @CheckPolices 装饰器接收一个或多个回调函数，并将其存储在 CHECK_POLICIES_KEY.HANDLER 中。
export type CaslHandlerType = PolicyHandlerCallback[]
// SetMetadata 将这些回调函数存储到 CHECK_POLICIES_KEY.HANDLER 中
export const CheckPolices = (...handlers: PolicyHandlerCallback[]) => SetMetadata(CHECK_POLICIES_KEY.HANDLER, handlers)
// 定义了一个装饰器 Can，用于将 ability.can 的权限检查逻辑绑定到元数据。

/**
 *
 * @param action 权限动作，例如 'read', 'create' 等。
 * @param subject 权限对象，例如一个模型类或者具体的实例。
 * @param conditions 额外的条件，用于更细粒度的权限控制。例如，在某些情况下你可能需要根据用户的角色或特定的属性来决定是否允许执行某个操作。这些条件会被传递给 ability.can 方法作为第三个参数。
 * @returns 使用 SetMetadata 将 ability.can 的逻辑存储到 CHECK_POLICIES_KEY.CAN 中
 */
export const Can = (action: Action, subject: InferSubjects<any>, conditions?: any) =>
  SetMetadata(CHECK_POLICIES_KEY.CAN, (ability: AnyMongoAbility) => ability.can(action, subject, conditions))

export const Cannot = (action: Action, subject: InferSubjects<any>, conditions?: any) =>
  SetMetadata(CHECK_POLICIES_KEY.CANNOT, (ability: AnyMongoAbility) => ability.cannot(action, subject, conditions))
```

4. 在enum目录下新建`action.enum.ts`文件，定义操作枚举
```ts
export enum Action {
  Manage = 'manage', // 管理权限
  Create = 'create', // 创建权限
  Read = 'read', // 读取权限
  Update = 'update', // 更新权限
  Delete = 'delete' // 删除权限
}
```

5. 在guards目录下新建`casl-ability.guard.ts`文件，定义权限守卫
```bash
$ nest g guard guards/casl-ability --no-spec
```

```ts
import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { CaslHandlerType, CHECK_POLICIES_KEY, PolicyHandlerCallback } from '../decotator/casl.decorator'
import { CaslAbilityService } from 'src/auth/casl-ability.service'

@Injectable()
export class CaslGuard implements CanActivate {
  constructor(
    private reflector: Reflector, // 用于获取装饰器上的数据
    private caslAbilityService: CaslAbilityService // 用于获取当前用户的权限
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // handlers‌：读取 CHECK_POLICIES_KEY.HANDLER 对应的自定义权限检查逻辑
    const handlers = this.reflector.getAllAndMerge<PolicyHandlerCallback[]>(CHECK_POLICIES_KEY.HANDLER, [
      context.getHandler(),
      context.getClass()
    ])
    // canHandlers：读取 CHECK_POLICIES_KEY.CAN 对应的权限检查逻辑
    const canHandlers = this.reflector.getAllAndMerge<any[]>(CHECK_POLICIES_KEY.CAN, [
      context.getHandler(),
      context.getClass()
    ]) as CaslHandlerType
    // cannotHandlers：读取 CHECK_POLICIES_KEY.CANNOT 对应的权限检查逻辑
    const cannotHandlers = this.reflector.getAllAndMerge<any[]>(CHECK_POLICIES_KEY.CANNOT, [
      context.getHandler(),
      context.getClass()
    ]) as CaslHandlerType
    // 判断，如果用户未设置上述的任何权限，那么就直接返回true
    if (handlers.length === 0 && canHandlers.length === 0 && cannotHandlers.length === 0) return true
    const req = context.switchToHttp().getRequest()
    if (!req.user) throw new ForbiddenException('用户不存在')
    // 获取当前用户的权限 调用 CaslAbilityService 的 forRoot 方法，根据用户的用户名生成一个 Ability 对象，表示用户的权限。
    const ability = await this.caslAbilityService.forRoot(req.user.username)
    let flag = true
    // 如果 handlers 存在，遍历每个回调函数，传入 ability 对象，检查是否都返回 true。
    if (handlers) {
      flag = flag && handlers.every(handler => handler(ability))
    }
    // 如果 flag 为 true，并且 canHandlers 存在，再次遍历每个回调函数，传入 ability 对象，检查是否都返回 true。
    if (flag && canHandlers) {
      flag = flag && canHandlers.every(handler => handler(ability))
    }
    // 如果 flag 为 true，并且 cannotHandlers 存在，再次遍历每个回调函数，传入 ability 对象，检查是否都返回 false。
    if (flag && cannotHandlers) {
      flag = flag && cannotHandlers.every(handler => handler(ability))
    }
    return flag
  }
}
```
7. 在controller目录下使用定义的装饰器
```ts
@UseGuards(JwtGuard, CaslGuard)
@CheckPolices(ability => ability.can(Action.Read, Logs))
@Can(Action.Read, Logs)
```

::: tip CASL 权限管理的流程
1. CaslAbilityService 负责根据用户信息构建权限对象。类似于
```js
[
  { action: 'read', subject: [class Users] },
  { action: 'create', subject: [class Users] },
  { action: 'delete', subject: [class Users] },
  { action: 'update', subject: [class Users] },
  { action: 'manage', subject: [class Users] },
  { action: 'read', subject: [class Logs] },
  { action: 'create', subject: [class Logs] },
  { action: 'delete', subject: [class Logs] }
]
```
2. CaslGuard 负责根据CaslAbilityService构建的权限对象，判断当前用户是否有对应的操作权限来进行守卫。
3. CaslDecorator 负责在控制器或者方法上定义权限规则。(CheckPolices, Can, Cannot)
:::



## 启动项目 
1. docker-compose up -d
2. npm run start:dev