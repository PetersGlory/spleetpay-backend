import { Request, Response } from 'express';
import { Admin/configService } from '../services/admin/config.service.js';
import { ApiResponse } from '../utils/response.js';
import { asyncHandler } from '../middleware/error.js';

export class Admin/configController {
  private admin/configService: Admin/configService;

  constructor() {
    this.admin/configService = new Admin/configService();
  }

  
  getAll = asyncHandler(async (req: Request, res: Response) => {
    const { page = 1, limit = 10, ...filters } = req.query;
    const result = await this.admin/configService.findMany({
      page: Number(page),
      limit: Number(limit),
      filters
    });
    
    ApiResponse.success(res, result, 'Admin/configs retrieved successfully');
  });

  

  

  
  update = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const admin/config = await this.admin/configService.update(id, req.body);
    
    ApiResponse.success(res, admin/config, 'Admin/config updated successfully');
  });

  
}