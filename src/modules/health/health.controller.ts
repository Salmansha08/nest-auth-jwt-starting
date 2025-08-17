import { Controller, Get, HttpStatus, HttpCode } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  HealthCheck,
  HealthCheckService,
  HttpHealthIndicator,
  TypeOrmHealthIndicator,
  MemoryHealthIndicator,
  DiskHealthIndicator,
} from '@nestjs/terminus';
import * as os from 'os';
import { SystemInfo } from '../../common/interfaces';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  private readonly memoryThreshold = {
    heap: 200 * 1024 * 1024, // 200MB
    rss: 300 * 1024 * 1024, // 300MB
  };

  private readonly diskThreshold = 0.85; // 85%

  constructor(
    private readonly configService: ConfigService,
    private readonly health: HealthCheckService,
    private readonly db: TypeOrmHealthIndicator,
    private readonly http: HttpHealthIndicator,
    private readonly memory: MemoryHealthIndicator,
    private readonly disk: DiskHealthIndicator,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Quick health check - essential services only' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  @ApiResponse({ status: 503, description: 'Service is unhealthy' })
  @HealthCheck()
  check() {
    // Only check critical services for faster response
    return this.health.check([
      () => this.db.pingCheck('database'),
      () => this.memory.checkHeap('memory_heap', this.memoryThreshold.heap),
    ]);
  }

  @Get('full')
  @ApiOperation({ summary: 'Comprehensive health check - all services' })
  @ApiResponse({ status: 200, description: 'All services are healthy' })
  @ApiResponse({
    status: 503,
    description: 'One or more services are unhealthy',
  })
  @HealthCheck()
  fullCheck() {
    return this.health.check([
      () => this.db.pingCheck('database'),
      () => this.memory.checkHeap('memory_heap', this.memoryThreshold.heap),
      () => this.memory.checkRSS('memory_rss', this.memoryThreshold.rss),
      () =>
        this.disk.checkStorage('storage', {
          path: process.platform === 'win32' ? 'C:\\' : '/',
          thresholdPercent: this.diskThreshold,
        }),
      () =>
        this.http.pingCheck(
          'external_service',
          'https://httpbin.org/status/200',
        ),
    ]);
  }

  @Get('database')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Database connectivity check only' })
  @ApiResponse({ status: 200, description: 'Database is healthy' })
  @ApiResponse({ status: 503, description: 'Database is unhealthy' })
  @HealthCheck()
  checkDatabase() {
    return this.health.check([() => this.db.pingCheck('database')]);
  }

  @Get('memory')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Memory usage check only' })
  @ApiResponse({ status: 200, description: 'Memory usage is healthy' })
  @ApiResponse({ status: 503, description: 'Memory usage is unhealthy' })
  @HealthCheck()
  checkMemory() {
    return this.health.check([
      () => this.memory.checkHeap('memory_heap', this.memoryThreshold.heap),
      () => this.memory.checkRSS('memory_rss', this.memoryThreshold.rss),
    ]);
  }

  @Get('info')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cached system information - lightweight' })
  @ApiResponse({ status: 200, description: 'System information' })
  getSystemInfo(): SystemInfo {
    // Cache static values to avoid repeated calculations
    const memoryUsage = process.memoryUsage();
    const freeMemory = os.freemem();
    const totalMemory = os.totalmem();

    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: {
        name: 'Backend API APP',
        version: process.env.npm_package_version || '1.0.0',
        environment: this.configService.get<string>('NODE_ENV', 'development'),
        nodeVersion: process.version,
        platform: process.platform,
        architecture: process.arch,
      },
      system: {
        uptime: {
          process: Math.floor(process.uptime()),
          system: Math.floor(os.uptime()),
        },
        memory: {
          rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`,
          heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
          heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
          external: `${Math.round(memoryUsage.external / 1024 / 1024)} MB`,
          freeMemory: `${Math.round(freeMemory / 1024 / 1024)} MB`,
          totalMemory: `${Math.round(totalMemory / 1024 / 1024)} MB`,
          usage: `${Math.round(((totalMemory - freeMemory) / totalMemory) * 100)}%`,
        },
        cpu: {
          user: process.cpuUsage().user,
          system: process.cpuUsage().system,
          loadAverage: os.loadavg(),
        },
      },
    };
  }

  @Get('metrics')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Essential metrics only - optimized for monitoring',
  })
  @ApiResponse({ status: 200, description: 'Application metrics' })
  getMetrics() {
    const memoryUsage = process.memoryUsage();

    return {
      timestamp: Date.now(), // Use timestamp for faster serialization
      process: {
        uptime: Math.floor(process.uptime()),
        pid: process.pid,
        memory: {
          heapUsed: memoryUsage.heapUsed,
          heapTotal: memoryUsage.heapTotal,
          rss: memoryUsage.rss,
        },
        cpu: process.cpuUsage(),
      },
      system: {
        loadAvg1: os.loadavg()[0], // Only 1-minute load average
        freeMemory: os.freemem(),
        totalMemory: os.totalmem(),
      },
      environment: this.configService.get<string>('NODE_ENV'),
    };
  }

  // Lightweight endpoints for container orchestration
  @Get('ready')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Kubernetes readiness probe - fast response' })
  @ApiResponse({ status: 200, description: 'Service is ready' })
  readinessCheck() {
    // Quick check - just return status without heavy operations
    return { status: 'ready', timestamp: Date.now() };
  }

  @Get('live')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Kubernetes liveness probe - fastest response' })
  @ApiResponse({ status: 200, description: 'Service is alive' })
  livenessCheck() {
    // Fastest possible response for liveness probe
    return { status: 'alive' };
  }

  @Get('status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Simple status check - minimal data' })
  @ApiResponse({ status: 200, description: 'Service status' })
  statusCheck() {
    return {
      status: 'ok',
      service: 'Backend API APP',
      environment: this.configService.get<string>('NODE_ENV'),
      uptime: Math.floor(process.uptime()),
    };
  }
}
