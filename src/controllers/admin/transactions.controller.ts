import { Request, Response } from 'express';
import { Admin/transactionsService } from '../services/admin/transactions.service.js';
import { ApiResponse } from '../utils/response.js';
import { asyncHandler } from '../middleware/error.js';

export class Admin/transactionsController {
  private admin/transactionsService: Admin/transactionsService;

  constructor() {
    this.admin/transactionsService = new Admin/transactionsService();
  }

  
  getAll = asyncHandler(async (req: Request, res: Response) => {
    const { page = 1, limit = 10, ...filters } = req.query;
    const result = await this.admin/transactionsService.findMany({
      page: Number(page),
      limit: Number(limit),
      filters
    });
    
    ApiResponse.success(res, result, 'Admin/transactionss retrieved successfully');
  });

  

  

  

  
}