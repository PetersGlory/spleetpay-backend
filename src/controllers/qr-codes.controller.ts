import { Request, Response } from 'express';
import { Qr-codesService } from '../services/qr-codes.service.js';
import { ApiResponse } from '../utils/response.js';
import { asyncHandler } from '../middleware/error.js';

export class Qr-codesController {
  private qr-codesService: Qr-codesService;

  constructor() {
    this.qr-codesService = new Qr-codesService();
  }

  
  getAll = asyncHandler(async (req: Request, res: Response) => {
    const { page = 1, limit = 10, ...filters } = req.query;
    const result = await this.qr-codesService.findMany({
      page: Number(page),
      limit: Number(limit),
      filters
    });
    
    ApiResponse.success(res, result, 'Qr-codess retrieved successfully');
  });

  
  getById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const qr-codes = await this.qr-codesService.findById(id);
    
    ApiResponse.success(res, qr-codes, 'Qr-codes retrieved successfully');
  });

  
  create = asyncHandler(async (req: Request, res: Response) => {
    const qr-codes = await this.qr-codesService.create(req.body);
    
    ApiResponse.success(res, qr-codes, 'Qr-codes created successfully', 201);
  });

  
  update = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const qr-codes = await this.qr-codesService.update(id, req.body);
    
    ApiResponse.success(res, qr-codes, 'Qr-codes updated successfully');
  });

  
  delete = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    await this.qr-codesService.delete(id);
    
    ApiResponse.success(res, null, 'Qr-codes deleted successfully', 204);
  });
}