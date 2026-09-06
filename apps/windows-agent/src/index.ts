import { createAgentServer } from './server.js';
import { getConfigPath, initConfig } from './config.js';
import { networkInterfaces } from 'node:os';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const qrcode = require('qrcode-terminal') as typeof import('qrcode-terminal');

const port = Number(process.env.SAVE_BRIDGE_PORT ?? 45821);

function getLanAddress() {
  const interfaces = Object.values(networkInterfaces()).flat();
  return interfaces.find((entry) => entry?.family === 'IPv4' && !entry.internal)?.address ?? '127.0.0.1';
}

async function main(): Promise<void> {
  const config = await initConfig();
  const server = createAgentServer();

  server.listen(port, '0.0.0.0', () => {
    const address = `http://${getLanAddress()}:${port}`;
    console.log(`SaveBridge agent listening on ${address}`);
    console.log(`Configured games folder: ${config.gamesRoot}`);
    console.log(`Local settings file: ${getConfigPath()}`);
    console.log('Pairing QR below. Scan it from the SaveBridge app (only the first time):');
    qrcode.generate(JSON.stringify({ address, token: config.token }), { small: true });
  });
}

main().catch((error) => {
  console.error('SaveBridge agent failed to start:', error);
  process.exitCode = 1;
});