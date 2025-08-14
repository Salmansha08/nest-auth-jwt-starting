import { NestApplication } from '@nestjs/core';

export const handleLocalEnvironment = async (
  app: NestApplication,
  basePort: number,
) => {
  let port: number = basePort;
  let isPortAvailable: boolean = false;
  const MAX_PORT_ATTEMPTS: number = 10;

  while (!isPortAvailable && port < basePort + MAX_PORT_ATTEMPTS) {
    try {
      await app.listen(port);
      isPortAvailable = true;

      if (port !== basePort) {
        console.log(
          `⚠️ Port ${basePort} was in use, using port ${port} instead`,
        );
      }
      console.log(`Application is running on port: ${port}`);
    } catch (error: unknown) {
      if ((error as { code?: string }).code === 'EADDRINUSE') {
        console.log(`Port ${port} is in use, trying port ${port + 1}`);
        port++;
      } else {
        console.error('Failed to start server:', error);
        process.exit(1);
      }
    }
  }

  if (!isPortAvailable) {
    console.error(
      `Could not find an available port within range ${basePort} to ${basePort + MAX_PORT_ATTEMPTS - 1}`,
    );
    process.exit(1);
  }
};
