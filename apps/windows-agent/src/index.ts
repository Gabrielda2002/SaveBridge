import { createServer } from 'node:http';

import type { AgentHealthResponse, DevicePlatform } from '@savebridge/protocol';

const platform: DevicePlatform = 'windows';
const port = Number(process.env.SAVE_BRIDGE_PORT ?? 45821);

const server = createServer((request, response) => {
  if (request.method === 'GET' && request.url === '/health') {
    const health: AgentHealthResponse = {
      service: 'savebridge-agent',
      version: '0.1.0',
      platform,
      status: 'ok',
    };
    const body = JSON.stringify(health);

    response.writeHead(200, {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body),
    });
    response.end(body);
    return;
  }

  response.writeHead(404, { 'Content-Type': 'application/json' });
  response.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(port, '0.0.0.0', () => {
  console.log(`SaveBridge agent listening on http://0.0.0.0:${port}`);
});
