import { createAgentServer } from './server.js';
import { getGamesRoot, getPairingToken } from './config.js';
import { networkInterfaces } from 'node:os';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const qrcode = require('qrcode-terminal') as typeof import('qrcode-terminal');

const port = Number(process.env.SAVE_BRIDGE_PORT ?? 45821);
const server = createAgentServer();

function getLanAddress() {
  const interfaces = Object.values(networkInterfaces()).flat();
  return interfaces.find((entry) => entry?.family === 'IPv4' && !entry.internal)?.address ?? '127.0.0.1';
}

server.listen(port, '0.0.0.0', () => {
  const address = `http://${getLanAddress()}:${port}`;
  console.log(`SaveBridge agent listening on ${address}`);
  console.log(`Configured games folder: ${getGamesRoot()}`);
  console.log(`Pairing token: ${getPairingToken()}`);
  console.log('Scan this QR code from the SaveBridge app:');
  qrcode.generate(JSON.stringify({ address, token: getPairingToken() }), { small: true });
});
