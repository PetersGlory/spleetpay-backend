import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/error.js';

const prisma = new PrismaClient();

export class Webhooks/settlement-statusService {
  async findMany(options: { page: number; limit: number; filters: any }) {
    const { page, limit, filters } = options;
    const skip = (page - 1) * limit;
    
    const [items, total] = await Promise.all([
      prisma.webhooks/settlement-status.findMany({
        skip,
        take: limit,
        where: filters,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.webhooks/settlement-status.count({ where: filters })
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
    const webhooks/settlement-status = await prisma.webhooks/settlement-status.findUnique({
      where: { id }
    });

    if (!webhooks/settlement-status) {
      throw new AppError('Webhooks/settlement-status not found', 404);
    }

    return webhooks/settlement-status;
  }

  async create(data: any) {
    return prisma.webhooks/settlement-status.create({ data });
  }

  async update(id: string, data: any) {
    const existing = await this.findById(id);
    
    return prisma.webhooks/settlement-status.update({
      where: { id },
      data
    });
  }

  async delete(id: string) {
    const existing = await this.findById(id);
    
    return prisma.webhooks/settlement-status.delete({
      where: { id }
    });
  }
}