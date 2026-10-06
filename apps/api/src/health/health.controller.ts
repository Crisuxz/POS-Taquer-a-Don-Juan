import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import type { HealthResponse } from '@pos/shared';
import type { Response } from 'express';
import { HealthService } from './health.service.js';

@Controller('health')
export class HealthController {
  constructor(private readonly health: HealthService) {}

  /** 200 si la API y sus dependencias responden; 503 si alguna falla. */
  @Get()
  async check(@Res({ passthrough: true }) response: Response): Promise<HealthResponse> {
    const result = await this.health.check();
    if (result.status !== 'ok') {
      response.status(HttpStatus.SERVICE_UNAVAILABLE);
    }
    return result;
  }
}
