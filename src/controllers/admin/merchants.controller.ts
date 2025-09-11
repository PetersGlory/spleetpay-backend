import { Request, Response } from 'express';
import { Admin/merchantsService } from '../services/admin/merchants.service.js';
import { ApiResponse } from '../utils/response.js';
import { asyncHandler } from '../middleware/error.js';

export class Admin/merchantsController {
  private admin/merchantsService: Admin/merchantsService;

  constructor() {
    this.admin/merchantsService = new Admin/merchantsService();
  }

  
  getAll = asyncHandler(async (req: Request, res: Response) => {
    const { page = 1, limit = 10, ...filters } = req.query;
    const result = await this.admin/merchantsService.findMany({
      page: Number(page),
      limit: Number(limit),
      filters
    });
    
    ApiResponse.success(res, result, 'Admin/merchantss retrieved successfully');
  });

  

  

  

  
}