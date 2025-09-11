import { Request, Response } from 'express';
import { Webhooks/settlement-statusService } from '../services/webhooks/settlement-status.service.js';
import { ApiResponse } from '../utils/response.js';
import { asyncHandler } from '../middleware/error.js';

export class Webhooks/settlement-statusController {
  private webhooks/settlement-statusService: Webhooks/settlement-statusService;

  constructor() {
    this.webhooks/settlement-statusService = new Webhooks/settlement-statusService();
  }

  

  

  
  create = asyncHandler(async (req: Request, res: Response) => {
    const webhooks/settlement-status = await this.webhooks/settlement-statusService.create(req.body);
    
    ApiResponse.success(res, webhooks/settlement-status, 'Webhooks/settlement-status created successfully', 201);
  });

  

  
}