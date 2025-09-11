import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/error.js';

const prisma = new PrismaClient();

export class Admin/configService {
  async findMany(options: { page: number; limit: number; filters: any }) {
    const { page, limit, filters } = options;
    const skip = (page - 1) * limit;
    
    const [items, total] = await Promise.all([
      prisma.admin/config.findMany({
        skip,
        take: limit,
        where: filters,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.admin/config.count({ where: filters })
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
    const admin/config = await prisma.admin/config.findUnique({
      where: { id }
    });

    if (!admin/config) {
      throw new AppError('Admin/config not found', 404);
    }

    return admin/config;
  }

  async create(data: any) {
    return prisma.admin/config.create({ data });
  }

  async update(id: string, data: any) {
    const existing = await this.findById(id);
    
    return prisma.admin/config.update({
      where: { id },
      data
    });
  }

  async delete(id: string) {
    const existing = await this.findById(id);
    
    return prisma.admin/config.delete({
      where: { id }
    });
  }
}