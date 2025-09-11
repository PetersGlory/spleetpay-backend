import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/error.js';

const prisma = new PrismaClient();

export class MerchantsService {
  async findMany(options: { page: number; limit: number; filters: any }) {
    const { page, limit, filters } = options;
    const skip = (page - 1) * limit;
    
    const [items, total] = await Promise.all([
      prisma.merchants.findMany({
        skip,
        take: limit,
        where: filters,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.merchants.count({ where: filters })
    ]);

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async findById(id: string) {
    const merchants = await prisma.merchants.findUnique({
      where: { id }
    });

    if (!merchants) {
      throw new AppError('Merchants not found', 404);
    }

    return merchants;
  }

  async create(data: any) {
    return prisma.merchants.create({ data });
  }

  async update(id: string, data: any) {
    const existing = await this.findById(id);
    
    return prisma.merchants.update({
      where: { id },
      data
    });
  }

  async delete(id: string) {
    const existing = await this.findById(id);
    
    return prisma.merchants.delete({
      where: { id }
    });
  }
}