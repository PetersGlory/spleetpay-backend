import { Request, Response } from 'express';
import { MerchantsService } from '../services/merchants.service.js';
import { ApiResponse } from '../utils/response.js';
import { asyncHandler } from '../middleware/error.js';

export class MerchantsController {
  private merchantsService: MerchantsService;

  constructor() {
    this.merchantsService = new MerchantsService();
  }

  
  getAll = asyncHandler(async (req: Request, res: Response) => {
    const { page = 1, limit = 10, ...filters } = req.query;
    const result = await this.merchantsService.findMany({
      page: Number(page),
      limit: Number(limit),
      filters
    });
    
    ApiResponse.success(res, result, 'Merchantss retrieved successfully');
  });

  
  getById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const merchants = await this.merchantsService.findById(id);
    
    ApiResponse.success(res, merchants, 'Merchants retrieved successfully');
  });

  
  create = asyncHandler(async (req: Request, res: Response) => {
    const merchants = await this.merchantsService.create(req.body);
    
    ApiResponse.success(res, merchants, 'Merchants created successfully', 201);
  });

  
  update = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const merchants = await this.merchantsService.update(id, req.body);
    
    ApiResponse.success(res, merchants, 'Merchants updated successfully');
  });

  
  delete = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    await this.merchantsService.delete(id);
    
    ApiResponse.success(res, null, 'Merchants deleted successfully', 204);
  });
}