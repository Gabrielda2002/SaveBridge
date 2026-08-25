import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';

import type {
  AgentHealthResponse,
  ConfigureGamesFolderRequest,
  ConfigureGamesFolderResponse,
  GameListResponse,
} from '@savebridge/protocol';

import { configureGamesRoot, getGamesRoot, isAuthorized } from './config.js';
import { findSaves } from './scanner.js';

function sendJson(response: ServerResponse, statusCode: number, payload: unknown) {
  const body = JSON.stringify(payload);
  response.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body),
  });
  response.end(body);
}

async function readJson<T>(request: IncomingMessage): Promise<T> {
  let body = '';
  for await (const chunk of request) {
    body += chunk;
    if (body.length > 8_192) {
      throw new Error('Request body is too large');
    }
  }
  return JSON.parse(body) as T;
}

export function createAgentServer() {
  return createServer(async (request, response) => {
    try {
      if (request.method === 'GET' && request.url === '/health') {
        const health: AgentHealthResponse = {
          service: 'savebridge-agent',
          version: '0.1.0',
          platform: 'windows',
          status: 'ok',
        };
        sendJson(response, 200, health);
        return;
      }

      if (!isAuthorized(request.headers['x-savebridge-token'] as string | undefined)) {
        sendJson(response, 401, { error: 'Unauthorized' });
        return;
      }

      if (request.method === 'POST' && request.url === '/config/games-folder') {
        const body = await readJson<ConfigureGamesFolderRequest>(request);
        const configuredRoot = await configureGamesRoot(body.gamesRoot);
        const result: ConfigureGamesFolderResponse = {
          gamesRoot: configuredRoot,
          status: 'configured',
        };
        sendJson(response, 200, result);
        return;
      }

      if (request.method === 'GET' && request.url === '/games') {
        const result: GameListResponse = {
          gamesRoot: getGamesRoot(),
          saves: await findSaves(getGamesRoot()),
        };
        sendJson(response, 200, result);
        return;
      }

      sendJson(response, 404, { error: 'Not found' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Request failed';
      sendJson(response, 400, { error: message });
    }
  });
}
