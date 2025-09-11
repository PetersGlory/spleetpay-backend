import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/error.js';

const prisma = new PrismaClient();

export class Admin/settlementsService {
  async findMany(options: { page: number; limit: number; filters: any }) {
    const { page, limit, filters } = options;
    const skip = (page - 1) * limit;
    
    const [items, total] = await Promise.all([
      prisma.admin/settlements.findMany({
        skip,
        take: limit,
        where: filters,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.admin/settlements.count({ where: filters })
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
    const admin/settlements = await prisma.admin/settlements.findUnique({
      where: { id }
    });

    if (!admin/settlements) {
      throw new AppError('Admin/settlements not found', 404);
    }

    return admin/settlements;
  }

  async create(data: any) {
    return prisma.admin/settlements.create({ data });
  }

  async update(id: string, data: any) {
    const existing = await this.findById(id);
    
    return prisma.admin/settlements.update({
      where: { id },
      data
    });
  }

  async delete(id: string) {
    const existing = await this.findById(id);
    
    return prisma.admin/settlements.delete({
      where: { id }
    });
  }
}