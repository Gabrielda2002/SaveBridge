import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';

import type {
  AgentHealthResponse,
  CompareSavesRequest,
  CompareSavesResponse,
  ConfigureGamesFolderRequest,
  ConfigureGamesFolderResponse,
  GameListResponse,
  SaveDownloadResponse,
  SaveUploadRequest,
  SaveUploadResponse,
} from '@savebridge/protocol';

import { configureGamesRoot, getGamesRoot, isAuthorized } from './config.js';
import { compareSaves } from './compare.js';
import { logger } from './logger.js';
import { findSaves } from './scanner.js';
import { downloadSave, uploadSave } from './transfer.js';

function sendJson(response: ServerResponse, statusCode: number, payload: unknown) {
  const body = JSON.stringify(payload);
  response.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body),
  });
  response.end(body);
}

async function readJson<T>(request: IncomingMessage, maxBytes = 8_192): Promise<T> {
  let body = '';
  for await (const chunk of request) {
    body += chunk;
    if (body.length > maxBytes) {
      throw new Error('Request body is too large');
    }
  }
  return JSON.parse(body) as T;
}

export function createAgentServer() {
  return createServer(async (request, response) => {
    const requestStart = performance.now();
    response.on('finish', () => {
      logger.info(
        {
          method: request.method,
          url: request.url,
          status: response.statusCode,
          durationMs: Math.round(performance.now() - requestStart),
        },
        'request completed',
      );
    });

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

      if (request.method === 'POST' && request.url === '/compare') {
        const body = await readJson<CompareSavesRequest>(request);
        const result: CompareSavesResponse = {
          games: compareSaves(body.androidSaves, await findSaves(getGamesRoot())),
        };
        sendJson(response, 200, result);
        return;
      }

      if (request.method === 'POST' && request.url === '/save/upload') {
        const body = await readJson<SaveUploadRequest>(request, 8_000_000);
        const result: SaveUploadResponse = await uploadSave(getGamesRoot(), body);
        sendJson(response, 200, result);
        return;
      }

      if (request.method === 'GET' && request.url?.startsWith('/save/download?')) {
        const searchParams = new URL(request.url, 'http://localhost').searchParams;
        const savePath = searchParams.get('savePath');
        if (!savePath) {
          sendJson(response, 400, { error: 'Missing savePath query parameter' });
          return;
        }
        const result: SaveDownloadResponse = await downloadSave(getGamesRoot(), savePath);
        sendJson(response, 200, result);
        return;
      }

      sendJson(response, 404, { error: 'Not found' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Request failed';
      logger.error({ err: error, url: request.url }, 'request failed');
      sendJson(response, 400, { error: message });
    }
  });
}
