import { Request, Response } from 'express';
import { Admin/logsService } from '../services/admin/logs.service.js';
import { ApiResponse } from '../utils/response.js';
import { asyncHandler } from '../middleware/error.js';

export class Admin/logsController {
  private admin/logsService: Admin/logsService;

  constructor() {
    this.admin/logsService = new Admin/logsService();
  }

  
  getAll = asyncHandler(async (req: Request, res: Response) => {
    const { page = 1, limit = 10, ...filters } = req.query;
    const result = await this.admin/logsService.findMany({
      page: Number(page),
      limit: Number(limit),
      filters
    });
    
    ApiResponse.success(res, result, 'Admin/logss retrieved successfully');
  });

  

  

  

  
}