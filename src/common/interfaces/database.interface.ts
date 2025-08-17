export interface DatabaseConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  schema: string;
  logging: boolean;
  entities: string[];
  autoLoadEntities: boolean;
  migrations: string[];
  synchronize: boolean;
}

export interface DatabaseURLConfig {
  url: string;
  logging: boolean;
  entities: string[];
  autoLoadEntities: boolean;
  migrations: string[];
  synchronize: boolean;
}
