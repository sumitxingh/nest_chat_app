import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { ClusterService } from './app-cluster.service';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);

  // Serve static files from the 'upload' directory
  app.useStaticAssets(join(__dirname, '..', 'upload'), {
    prefix: '/images/',
  });

  // Retrieve the port from the ConfigService
  const port = configService.get<number>('PORT') || 3000;
  app.enableCors(
    {
      origin: '*',
      credentials: true,
    }
  )

  // Start listening on the configured port
  await app.listen(port);

  // Log the server running information
  console.log(`Server is running on http://localhost:${port}`);
}
ClusterService.clusterize(bootstrap);
// bootstrap();
