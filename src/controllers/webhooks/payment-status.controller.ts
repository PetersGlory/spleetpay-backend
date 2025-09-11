import { Request, Response } from 'express';
import { Webhooks/payment-statusService } from '../services/webhooks/payment-status.service.js';
import { ApiResponse } from '../utils/response.js';
import { asyncHandler } from '../middleware/error.js';

export class Webhooks/payment-statusController {
  private webhooks/payment-statusService: Webhooks/payment-statusService;

  constructor() {
    this.webhooks/payment-statusService = new Webhooks/payment-statusService();
  }

  

  

  
  create = asyncHandler(async (req: Request, res: Response) => {
    const webhooks/payment-status = await this.webhooks/payment-statusService.create(req.body);
    
    ApiResponse.success(res, webhooks/payment-status, 'Webhooks/payment-status created successfully', 201);
  });

  

  
}