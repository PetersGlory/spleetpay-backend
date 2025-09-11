import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/error.js';

const prisma = new PrismaClient();

export class Admin/analyticsService {
  async findMany(options: { page: number; limit: number; filters: any }) {
    const { page, limit, filters } = options;
    const skip = (page - 1) * limit;
    
    const [items, total] = await Promise.all([
      prisma.admin/analytics.findMany({
        skip,
        take: limit,
        where: filters,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.admin/analytics.count({ where: filters })
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
    const admin/analytics = await prisma.admin/analytics.findUnique({
      where: { id }
    });

    if (!admin/analytics) {
      throw new AppError('Admin/analytics not found', 404);
    }

    return admin/analytics;
  }

  async create(data: any) {
    return prisma.admin/analytics.create({ data });
  }

  async update(id: string, data: any) {
    const existing = await this.findById(id);
    
    return prisma.admin/analytics.update({
      where: { id },
      data
    });
  }

  async delete(id: string) {
    const existing = await this.findById(id);
    
    return prisma.admin/analytics.delete({
      where: { id }
    });
  }
}