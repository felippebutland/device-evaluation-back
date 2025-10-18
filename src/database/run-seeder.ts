import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { InitialDataSeeder } from './seeders/initial-data.seeder';

async function runSeeder() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const seeder = app.get(InitialDataSeeder);

  try {
    await seeder.run();
    console.log('✅ Seeder executado com sucesso');
  } catch (error) {
    console.error('❌ Erro ao executar seeder:', error);
  } finally {
    await app.close();
  }
}

runSeeder();
