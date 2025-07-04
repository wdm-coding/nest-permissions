import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import setupApp from './utils/setup'
async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  setupApp(app)
  await app.listen(process.env.PORT ?? 3000)
}
bootstrap()
