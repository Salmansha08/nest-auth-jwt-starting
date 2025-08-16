export interface SystemInfo {
  status: string;
  timestamp: string;
  service: {
    name: string;
    version: string;
    environment: string;
    nodeVersion: string;
    platform: string;
    architecture: string;
  };
  system: {
    uptime: {
      process: number;
      system: number;
    };
    memory: {
      rss: string;
      heapTotal: string;
      heapUsed: string;
      external: string;
      freeMemory: string;
      totalMemory: string;
      usage: string;
    };
    cpu: {
      user: number;
      system: number;
      loadAverage: number[];
    };
  };
}
