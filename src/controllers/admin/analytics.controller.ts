import { Request, Response } from 'express';
import { Admin/analyticsService } from '../services/admin/analytics.service.js';
import { ApiResponse } from '../utils/response.js';
import { asyncHandler } from '../middleware/error.js';

export class Admin/analyticsController {
  private admin/analyticsService: Admin/analyticsService;

  constructor() {
    this.admin/analyticsService = new Admin/analyticsService();
  }

  
  getAll = asyncHandler(async (req: Request, res: Response) => {
    const { page = 1, limit = 10, ...filters } = req.query;
    const result = await this.admin/analyticsService.findMany({
      page: Number(page),
      limit: Number(limit),
      filters
    });
    
    ApiResponse.success(res, result, 'Admin/analyticss retrieved successfully');
  });

  

  

  

  
}