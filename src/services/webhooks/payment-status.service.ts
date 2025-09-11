import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/error.js';

const prisma = new PrismaClient();

export class Webhooks/payment-statusService {
  async findMany(options: { page: number; limit: number; filters: any }) {
    const { page, limit, filters } = options;
    const skip = (page - 1) * limit;
    
    const [items, total] = await Promise.all([
      prisma.webhooks/payment-status.findMany({
        skip,
        take: limit,
        where: filters,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.webhooks/payment-status.count({ where: filters })
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
    const webhooks/payment-status = await prisma.webhooks/payment-status.findUnique({
      where: { id }
    });

    if (!webhooks/payment-status) {
      throw new AppError('Webhooks/payment-status not found', 404);
    }

    return webhooks/payment-status;
  }

  async create(data: any) {
    return prisma.webhooks/payment-status.create({ data });
  }

  async update(id: string, data: any) {
    const existing = await this.findById(id);
    
    return prisma.webhooks/payment-status.update({
      where: { id },
      data
    });
  }

  async delete(id: string) {
    const existing = await this.findById(id);
    
    return prisma.webhooks/payment-status.delete({
      where: { id }
    });
  }
}