import { KuebikoDb } from '@renderer/db/kuebiko-db';
import { Resource } from '@renderer/db/models/resource';
import { ResourceMarshaller } from '@renderer/services/test-package-service/marshallers/resource-marshaller';
import { Manifest } from '@renderer/services/test-package-service/model/manifest';
import { TestPackageResource } from '@renderer/services/test-package-service/model/test-package-resource';
import { BinaryLike, createHash } from 'crypto';
import * as fs from 'fs';
import JSZip, { JSZipObject } from 'jszip';
import { describe, expect, test, vi } from 'vitest';

// Mock the DB
vi.mock('@renderer/db/kuebiko-db.ts', () => {
    const KuebikoDb = vi.fn();
    KuebikoDb.prototype.resources = {
        add: vi.fn().mockImplementation(() => Promise.resolve()),
    };
    return {
        KuebikoDb: KuebikoDb,
    };
});

// Mock Electron IPC Renderer
vi.stubGlobal('electron', {
    ipcRenderer: {
        sendSync: (hash: string, data: BinaryLike) => {
            const result = createHash(hash).update(data).digest('hex');
            return result;
        },
    },
});

describe('resource marshaller', async () => {
    const kuebikoDb = new KuebikoDb();
    const bytes = new Uint8Array(fs.readFileSync('./src/renderer/src/test/resources/vite.png'));

    const jszip = {
        files: {
            'question1.md': {
                async: vi.fn(() => 'What is the solution to `2 + 2`?'),
            } as unknown as JSZipObject,
            'vite.png': {
                async: vi.fn(() => bytes),
            },
        },
    } as unknown as JSZip;

    let resourceMarshaller = new ResourceMarshaller(jszip, {} as unknown as Manifest, kuebikoDb);

    test('unmarshalls MARKDOWN type', async () => {
        const toUnmarshall = {
            uuid: 'a3dadsfgkj3',
            name: 'question1.md',
            type: 'MARKDOWN',
            mime: 'text/markdown',
            sha256: '9a1f47f68e2e68ea497a6769bccab63c993a134442a0b6b896f89c4d0c2c06e7',
        } as TestPackageResource;

        expect(await resourceMarshaller.unmarshall(toUnmarshall)).toStrictEqual({
            uuid: 'a3dadsfgkj3',
            name: 'question1.md',
            type: 'MARKDOWN',
            mime: 'text/markdown',
            sha256: '9a1f47f68e2e68ea497a6769bccab63c993a134442a0b6b896f89c4d0c2c06e7',
            data: 'What is the solution to `2 + 2`?',
        } as Resource);
    });

    test('unmarshalls IMAGE type', async () => {
        const toUnmarshall = {
            uuid: 'a3dadsfgkj3',
            name: 'vite.png',
            type: 'IMAGE',
            mime: 'image/png',
            sha256: 'bfcfba88f604fa97e1da2364896999eb299810cb61eb004fde7510787b4dad25',
        } as TestPackageResource;

        expect(await resourceMarshaller.unmarshall(toUnmarshall)).toStrictEqual({
            uuid: 'a3dadsfgkj3',
            name: 'vite.png',
            type: 'IMAGE',
            mime: 'image/png',
            sha256: 'bfcfba88f604fa97e1da2364896999eb299810cb61eb004fde7510787b4dad25',
            data: bytes,
        } as Resource);
    });

    test('unmarshalls AUDIO type', async () => {
        const toUnmarshall = {
            uuid: 'a3dadsfgkj3',
            name: 'vite.png',
            type: 'AUDIO',
            mime: 'audio/mp3',
            sha256: 'bfcfba88f604fa97e1da2364896999eb299810cb61eb004fde7510787b4dad25',
        } as TestPackageResource;

        expect(await resourceMarshaller.unmarshall(toUnmarshall)).toStrictEqual({
            uuid: 'a3dadsfgkj3',
            name: 'vite.png',
            type: 'AUDIO',
            mime: 'audio/mp3',
            sha256: 'bfcfba88f604fa97e1da2364896999eb299810cb61eb004fde7510787b4dad25',
            data: bytes,
        } as Resource);
    });

    test('unmarshalls VIDEO type', async () => {
        const toUnmarshall = {
            uuid: 'a3dadsfgkj3',
            name: 'vite.png',
            type: 'VIDEO',
            mime: 'video/mp4',
            sha256: 'bfcfba88f604fa97e1da2364896999eb299810cb61eb004fde7510787b4dad25',
        } as TestPackageResource;

        expect(await resourceMarshaller.unmarshall(toUnmarshall)).toStrictEqual({
            uuid: 'a3dadsfgkj3',
            name: 'vite.png',
            type: 'VIDEO',
            mime: 'video/mp4',
            sha256: 'bfcfba88f604fa97e1da2364896999eb299810cb61eb004fde7510787b4dad25',
            data: bytes,
        } as Resource);
    });
});
