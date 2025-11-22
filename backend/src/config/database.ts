import mongoose from 'mongoose';
import { DataSource } from 'typeorm';
import { createClient, RedisClientType } from 'redis';
import { Client as ElasticsearchClient } from '@elastic/elasticsearch';
import logger from './logger';

// MongoDB Connection
export const connectMongoDB = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/micro_influencer';

    await mongoose.connect(mongoUri);

    logger.info('MongoDB connected successfully');

    mongoose.connection.on('error', (error) => {
      logger.error('MongoDB connection error:', error);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });
  } catch (error) {
    logger.error('MongoDB connection failed:', error);
    process.exit(1);
  }
};

// PostgreSQL Connection (TypeORM)
export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  username: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'postgres',
  database: process.env.POSTGRES_DB || 'micro_influencer',
  synchronize: process.env.NODE_ENV === 'development',
  logging: process.env.NODE_ENV === 'development',
  entities: ['src/models/postgres/**/*.ts'],
  migrations: ['src/migrations/**/*.ts'],
  subscribers: ['src/subscribers/**/*.ts'],
});

export const connectPostgreSQL = async (): Promise<void> => {
  try {
    await AppDataSource.initialize();
    logger.info('PostgreSQL connected successfully');
  } catch (error) {
    logger.error('PostgreSQL connection failed:', error);
    process.exit(1);
  }
};

// Redis Connection
let redisClient: RedisClientType;

export const connectRedis = async (): Promise<RedisClientType> => {
  try {
    redisClient = createClient({
      socket: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
      },
      password: process.env.REDIS_PASSWORD,
    });

    redisClient.on('error', (error) => {
      logger.error('Redis connection error:', error);
    });

    redisClient.on('connect', () => {
      logger.info('Redis connected successfully');
    });

    await redisClient.connect();

    return redisClient;
  } catch (error) {
    logger.error('Redis connection failed:', error);
    process.exit(1);
  }
};

export const getRedisClient = (): RedisClientType => {
  if (!redisClient) {
    throw new Error('Redis client not initialized');
  }
  return redisClient;
};

// Elasticsearch Connection
let elasticsearchClient: ElasticsearchClient;

export const connectElasticsearch = (): ElasticsearchClient => {
  try {
    elasticsearchClient = new ElasticsearchClient({
      node: process.env.ELASTICSEARCH_NODE || 'http://localhost:9200',
    });

    logger.info('Elasticsearch client initialized');

    return elasticsearchClient;
  } catch (error) {
    logger.error('Elasticsearch initialization failed:', error);
    process.exit(1);
  }
};

export const getElasticsearchClient = (): ElasticsearchClient => {
  if (!elasticsearchClient) {
    throw new Error('Elasticsearch client not initialized');
  }
  return elasticsearchClient;
};

// Initialize all databases
export const initializeDatabases = async (): Promise<void> => {
  await connectMongoDB();
  await connectPostgreSQL();
  await connectRedis();
  connectElasticsearch();
};
