import { Injectable, Logger } from '@nestjs/common';
import type { DependencyHealth, HealthResponse } from '@pos/shared';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);

  constructor(private readonly prisma: PrismaService) {}

  async check(): Promise<HealthResponse> {
    const database = await this.checkDatabase();
    return {
      status: database.status === 'up' ? 'ok' : 'error',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      checks: { database },
    };
  }

  private async checkDatabase(): Promise<DependencyHealth> {
    const startedAt = performance.now();
    const latencyMs = () => Math.round(performance.now() - startedAt);
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: 'up', latencyMs: latencyMs() };
    } catch (error) {
      // Solo el mensaje: los errores de conexión no incluyen credenciales.
      const reason = error instanceof Error ? error.message : String(error);
      this.logger.warn(`Base de datos no disponible: ${reason}`);
      return { status: 'down', latencyMs: latencyMs() };
    }
  }
}
