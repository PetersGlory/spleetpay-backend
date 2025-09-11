import { PrismaClient } from '@prisma/client';
import config from './index.js';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: config.databaseUrl
    }
  }
});

export default prisma;