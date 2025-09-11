import { Request, Response } from 'express';
import { TransactionsService } from '../services/transactions.service.js';
import { ApiResponse } from '../utils/response.js';
import { asyncHandler } from '../middleware/error.js';

export class TransactionsController {
  private transactionsService: TransactionsService;

  constructor() {
    this.transactionsService = new TransactionsService();
  }

  
  getAll = asyncHandler(async (req: Request, res: Response) => {
    const { page = 1, limit = 10, ...filters } = req.query;
    const result = await this.transactionsService.findMany({
      page: Number(page),
      limit: Number(limit),
      filters
    });
    
    ApiResponse.success(res, result, 'Transactionss retrieved successfully');
  });

  
  getById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const transactions = await this.transactionsService.findById(id);
    
    ApiResponse.success(res, transactions, 'Transactions retrieved successfully');
  });

  
  create = asyncHandler(async (req: Request, res: Response) => {
    const transactions = await this.transactionsService.create(req.body);
    
    ApiResponse.success(res, transactions, 'Transactions created successfully', 201);
  });

  
  update = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const transactions = await this.transactionsService.update(id, req.body);
    
    ApiResponse.success(res, transactions, 'Transactions updated successfully');
  });

  
  delete = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    await this.transactionsService.delete(id);
    
    ApiResponse.success(res, null, 'Transactions deleted successfully', 204);
  });
}