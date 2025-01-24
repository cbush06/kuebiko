import { Resource } from '@renderer/db/models/resource';
import { ResourceMarshaller } from '@renderer/services/test-package-service/marshallers/resource-marshaller';
import { Manifest } from '@renderer/services/test-package-service/model/manifest';
import { TestPackageResource } from '@renderer/services/test-package-service/model/test-package-resource';
import { BinaryLike, createHash } from 'crypto';
import * as fs from 'fs';
import JSZip, { JSZipObject } from 'jszip';
import { describe, test, vi } from 'vitest';
import { DeliveryDbFacade } from '@renderer/services/delivery-db-facade';

// Mock the DB
vi.mock('@renderer/services/delivery-db-facade.ts', () => ({
    DeliveryDbFacade: {
        resources: {
            add: vi.fn().mockImplementation(() => Promise.resolve()),
        },
    },
}));

describe('resource marshaller', async () => {
    const bytes = new Uint8Array(fs.readFileSync('./src/renderer/src/test/resources/vite.png'));

    const fileMock = vi.fn();

    const jszip = {
        files: {
            'question1.md': {
                async: vi.fn(() => 'What is the solution to `2 + 2`?'),
            } as unknown as JSZipObject,
            'vite.png': {
                async: vi.fn(() => bytes),
            } as unknown as JSZipObject,
        },
        file: fileMock,
    } as unknown as JSZip;

    const resourceMarshaller = new ResourceMarshaller(
        jszip,
        DeliveryDbFacade,
        {} as unknown as Manifest,
    );

    beforeAll(() => {
        // Mock Electron IPC Renderer
        globalThis.kuebikoAPI = Object.assign({}, globalThis.kuebikoAPI, {
            sha256: vi.fn().mockImplementation((data: BinaryLike) => {
                return createHash('sha256').update(data).digest('hex');
            }),
        });
    });

    afterAll(() => {
        vi.restoreAllMocks();

        // @ts-expect-error - deleting a non-optional property
        delete globalThis.kuebikoAPI;
    });

    describe('unmarshalls', () => {
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

    describe('marshalls', () => {
        // @ts-expect-error - missing properties
        const textPayloadResource: Resource = {
            uuid: 'ba206a5a-d73b-46b1-9c57-486e6ea7829a',
            mime: 'text/markdown',
            name: 'question1.md',
            type: 'MARKDOWN',
            data: 'What is the solution to `2 + 2`?',
        };

        // @ts-expect-error - missing properties
        const binaryPayloadResource: Resource = {
            uuid: 'ba206a5a-d73b-46b1-9c57-486e6ea7829a',
            mime: 'image/png',
            name: 'vite.png',
            type: 'IMAGE',
            data: bytes,
        };

        test('marshalls MARKDOWN type', async () => {
            expect(await resourceMarshaller.marshall(textPayloadResource)).toStrictEqual({
                mime: textPayloadResource.mime,
                name: textPayloadResource.name,
                type: textPayloadResource.type,
                uuid: textPayloadResource.uuid,
                sha256: '9a1f47f68e2e68ea497a6769bccab63c993a134442a0b6b896f89c4d0c2c06e7',
            } as TestPackageResource);

            expect(fileMock).toHaveBeenCalledWith(
                textPayloadResource.name,
                textPayloadResource.data,
            );
        });

        test('marshalls IMAGE type', async () => {
            expect(await resourceMarshaller.marshall(binaryPayloadResource)).toStrictEqual({
                mime: binaryPayloadResource.mime,
                name: binaryPayloadResource.name,
                type: binaryPayloadResource.type,
                uuid: binaryPayloadResource.uuid,
                sha256: 'bfcfba88f604fa97e1da2364896999eb299810cb61eb004fde7510787b4dad25',
            } as TestPackageResource);

            expect(fileMock).toHaveBeenCalledWith(
                binaryPayloadResource.name,
                binaryPayloadResource.data,
            );
        });

        test('marshalls AUDIO type', async () => {
            expect(
                await resourceMarshaller.marshall({
                    ...binaryPayloadResource,
                    mime: 'audio/wav',
                    name: 'nocturne5.wav',
                    type: 'AUDIO',
                }),
            ).toStrictEqual({
                mime: 'audio/wav',
                name: 'nocturne5.wav',
                type: 'AUDIO',
                uuid: binaryPayloadResource.uuid,
                sha256: 'bfcfba88f604fa97e1da2364896999eb299810cb61eb004fde7510787b4dad25',
            } as TestPackageResource);

            expect(fileMock).toHaveBeenCalledWith('nocturne5.wav', binaryPayloadResource.data);
        });

        test('marshalls VIDO type', async () => {
            expect(
                await resourceMarshaller.marshall({
                    ...binaryPayloadResource,
                    mime: 'video/mp4',
                    name: 'hamlet.mp4',
                    type: 'VIDEO',
                }),
            ).toStrictEqual({
                mime: 'video/mp4',
                name: 'hamlet.mp4',
                type: 'VIDEO',
                uuid: binaryPayloadResource.uuid,
                sha256: 'bfcfba88f604fa97e1da2364896999eb299810cb61eb004fde7510787b4dad25',
            } as TestPackageResource);

            expect(fileMock).toHaveBeenCalledWith('hamlet.mp4', binaryPayloadResource.data);
        });
    });
});
