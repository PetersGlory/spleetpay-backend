import { Request, Response } from 'express';
import { GroupSplitsService } from '../services/group-splits.service.js';
import { ApiResponse } from '../utils/response.js';
import { asyncHandler } from '../middleware/error.js';

export class GroupSplitsController {
  private groupSplitsService: GroupSplitsService;

  constructor() {
    this.groupSplitsService = new GroupSplitsService();
  }

  
  getAll = asyncHandler(async (req: Request, res: Response) => {
    const { page = 1, limit = 10, ...filters } = req.query;
    const result = await this.groupSplitsService.findMany({
      page: Number(page),
      limit: Number(limit),
      filters
    });
    
    ApiResponse.success(res, result, 'groupSplitss retrieved successfully');
  });

  
  getById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const groupSplits = await this.groupSplitsService.findById(id);
    
    ApiResponse.success(res, groupSplits, 'groupSplits retrieved successfully');
  });

  
  create = asyncHandler(async (req: Request, res: Response) => {
    const groupSplits = await this.groupSplitsService.create(req.body);
    
    ApiResponse.success(res, groupSplits, 'groupSplits created successfully', 201);
  });

  
  update = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const groupSplits = await this.groupSplitsService.update(id, req.body);
    
    ApiResponse.success(res, groupSplits, 'groupSplits updated successfully');
  });

  
  delete = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    await this.groupSplitsService.delete(id);
    
    ApiResponse.success(res, null, 'groupSplits deleted successfully', 204);
  });
}