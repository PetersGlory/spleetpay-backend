import { Request, Response } from 'express';
import { HealthService } from '../services/health.service.js';
import { ApiResponse } from '../utils/response.js';
import { asyncHandler } from '../middleware/error.js';

export class HealthController {
  private healthService: HealthService;

  constructor() {
    this.healthService = new HealthService();
  }

  

  
  getById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const health = await this.healthService.findById(id);
    
    ApiResponse.success(res, health, 'Health retrieved successfully');
  });

  

  

  
}