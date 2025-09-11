import { Request, Response } from 'express';
import { SettlementsService } from '../services/settlements.service.js';
import { ApiResponse } from '../utils/response.js';
import { asyncHandler } from '../middleware/error.js';

export class SettlementsController {
  private settlementsService: SettlementsService;

  constructor() {
    this.settlementsService = new SettlementsService();
  }

  
  getAll = asyncHandler(async (req: Request, res: Response) => {
    const { page = 1, limit = 10, ...filters } = req.query;
    const result = await this.settlementsService.findMany({
      page: Number(page),
      limit: Number(limit),
      filters
    });
    
    ApiResponse.success(res, result, 'Settlementss retrieved successfully');
  });

  
  getById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const settlements = await this.settlementsService.findById(id);
    
    ApiResponse.success(res, settlements, 'Settlements retrieved successfully');
  });

  
  create = asyncHandler(async (req: Request, res: Response) => {
    const settlements = await this.settlementsService.create(req.body);
    
    ApiResponse.success(res, settlements, 'Settlements created successfully', 201);
  });

  
  update = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const settlements = await this.settlementsService.update(id, req.body);
    
    ApiResponse.success(res, settlements, 'Settlements updated successfully');
  });

  
  delete = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    await this.settlementsService.delete(id);
    
    ApiResponse.success(res, null, 'Settlements deleted successfully', 204);
  });
}