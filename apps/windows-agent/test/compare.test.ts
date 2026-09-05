import assert from 'node:assert/strict';
import test from 'node:test';

import type { GameSaveDescriptor } from '@savebridge/protocol';

import { compareSaves } from '../src/compare.js';

function save(saveFileName: string, sha256: string): GameSaveDescriptor {
  return {
    gameId: saveFileName,
    saveFileName,
    savePath: `/saves/${saveFileName}`,
    size: 128,
    modifiedAt: '2026-01-01T00:00:00.000Z',
    sha256,
  };
}

test('matches save names case-insensitively and ignores the .sav extension', () => {
  const games = compareSaves(
    [save('Pokemon Blanco.sav', 'same-hash')],
    [save('pokemon_blanco.SAV', 'same-hash')],
  );

  assert.equal(games.length, 1);
  assert.equal(games[0]?.gameId, 'Pokemon Blanco.sav');
  assert.equal(games[0]?.presentOn, 'both');
  assert.equal(games[0]?.status, 'same');
});

test('classifies different hashes as conflicts without choosing a winner', () => {
  const games = compareSaves([save('Platino.sav', 'android-hash')], [save('Platino.sav', 'windows-hash')]);

  assert.equal(games[0]?.status, 'conflict');
  assert.equal(games[0]?.android?.sha256, 'android-hash');
  assert.equal(games[0]?.windows?.sha256, 'windows-hash');
});

test('classifies saves present on only one device as missing', () => {
  const games = compareSaves(
    [save('Esmeralda.sav', 'android-only')],
    [save('HeartGold.sav', 'windows-only')],
  );

  assert.deepEqual(
    games.map(({ gameId, presentOn, status }) => ({ gameId, presentOn, status })),
    [
      { gameId: 'Esmeralda.sav', presentOn: 'android', status: 'missing' },
      { gameId: 'HeartGold.sav', presentOn: 'windows', status: 'missing' },
    ],
  );
});
