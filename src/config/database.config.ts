import { registerAs } from '@nestjs/config';

export default registerAs('database', () => {
  // Railway provides DATABASE_URL, fallback to individual env vars for local dev
  if (process.env.DATABASE_URL) {
    return {
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      synchronize: process.env.NODE_ENV !== 'production',
      logging: process.env.NODE_ENV !== 'production',
      migrations: [__dirname + '/../migrations/**/*{.ts,.js}'],
      migrationsTableName: 'migrations',
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    };
  }

  // Fallback for local development
  return {
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: process.env.NODE_ENV !== 'production',
    logging: process.env.NODE_ENV !== 'production',
    migrations: [__dirname + '/../migrations/**/*{.ts,.js}'],
    migrationsTableName: 'migrations',
  };
});
