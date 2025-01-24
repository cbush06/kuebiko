import { Test } from '@renderer/db/models/test';
import { AuthorMarshaller } from '@renderer/services/test-package-service/marshallers/author-marshaller';
import { ResourceMarshaller } from '@renderer/services/test-package-service/marshallers/resource-marshaller';
import { SectionMarshaller } from '@renderer/services/test-package-service/marshallers/section-marshaller';
import { TestMarshaller } from '@renderer/services/test-package-service/marshallers/test-marshaller';
import { Manifest } from '@renderer/services/test-package-service/model/manifest';
import JSZip from 'jszip';
import { describe, expect, test, vi } from 'vitest';
import { DeliveryDbFacade } from '@renderer/services/delivery-db-facade';

// Mock the DB
vi.mock('@renderer/services/delivery-db-facade', () => ({
    DeliveryDbFacade: {
        questions: {
            add: vi.fn().mockImplementation(() => Promise.resolve()),
        },
        resources: {
            add: vi.fn().mockImplementation(() => Promise.resolve()),
        },
        tests: {
            add: vi.fn().mockImplementation(() => Promise.resolve()),
        },
    },
}));

describe('test marshaller', async () => {
    const resourceMarshaller = {
        unmarshall: vi.fn(() => ({ uuid: 'a23gk3l' })),
    } as unknown as ResourceMarshaller;
    const authorMarshaller = {
        unmarshall: vi.fn(() => ({ name: 'Author' })),
    } as unknown as AuthorMarshaller;
    const sectionMarshaller = {
        unmarshall: vi.fn(() => ({
            uuid: 'k3flkj32r',
            default: true,
            title: 'section 1',
            questionRefs: [],
        })),
    } as unknown as SectionMarshaller;

    const testMarshaller = new TestMarshaller(
        {} as JSZip,
        DeliveryDbFacade,
        authorMarshaller,
        resourceMarshaller,
        sectionMarshaller,
        {} as Manifest,
    );

    const toUnmarshal = {
        uuid: 'a3fadkads3',
        title: 'The Test',
        version: 1,
        allowedTime: 333000,
        descriptionRef: '14669f35-7d26-4f86-97c9-2c38a6a228ed',
        authors: [
            {
                name: 'Mr. Author',
                email: 'author@books.com',
            },
        ],
        created: new Date().toISOString(),
        resources: [
            {
                uuid: 'a23gk3l',
                name: 'resource',
                type: 'MARKDOWN',
                mime: 'text/markdown',
                sha256: 'dfk342faknl',
            },
        ],
        sections: [
            {
                uuid: 'k3flkj32r',
                default: true,
                title: 'section 1',
                questions: [],
            },
        ],
        tags: ['cars', 'mechanical', 'automobiles'],
    } as Manifest;

    test('unmarshalls fields', async () => {
        const unmarshalled = await testMarshaller.unmarshall(toUnmarshal);

        expect(unmarshalled).toStrictEqual({
            uuid: 'a3fadkads3',
            title: 'The Test',
            version: 1,
            allowedTime: 333000,
            descriptionRef: '14669f35-7d26-4f86-97c9-2c38a6a228ed',
            authors: [{ name: 'Author' }],
            created: new Date(toUnmarshal.created),
            resourceRefs: ['a23gk3l'],
            sections: [
                {
                    uuid: 'k3flkj32r',
                    default: true,
                    title: 'section 1',
                    questionRefs: [],
                },
            ],
            tags: ['cars', 'mechanical', 'automobiles'],
        } as Test);

        expect(authorMarshaller.unmarshall).toHaveBeenCalledWith(toUnmarshal.authors[0]);
        expect(resourceMarshaller.unmarshall).toHaveBeenCalledWith(toUnmarshal.resources[0]);
        expect(sectionMarshaller.unmarshall).toHaveBeenCalledWith(toUnmarshal.sections[0]);
        expect(DeliveryDbFacade.tests.add).toHaveBeenCalledWith(unmarshalled);
    });
});
