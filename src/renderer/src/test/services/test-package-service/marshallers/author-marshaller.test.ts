import { Author } from '@renderer/db/models/author';
import { AuthorMarshaller } from '@renderer/services/test-package-service/marshallers/author-marshaller';
import { Manifest } from '@renderer/services/test-package-service/model/manifest';
import { TestPackageAuthor } from '@renderer/services/test-package-service/model/test-package-author';
import JSZip from 'jszip';
import { describe, expect, test } from 'vitest';
import { KuebikoDbFacade } from '@renderer/services/kuebiko-db-facade';

describe('author marshaller', async () => {
    let authorMarshaller = new AuthorMarshaller(
        {} as JSZip,
        {} as KuebikoDbFacade,
        {} as unknown as Manifest,
    );

    describe('unmarshalls', () => {
        const toUnmarshal = {
            name: 'Bob Marley',
            email: 'bob@marley.com',
        } as TestPackageAuthor;

        test('unmarshalls fields', async () => {
            expect(await authorMarshaller.unmarshall(toUnmarshal)).toStrictEqual({
                name: 'Bob Marley',
                email: 'bob@marley.com',
            } as Author);
        });
    });

    describe('marshalls', () => {
        const toMarshall = {
            name: 'Bob Marley',
            email: 'bob@marley.com',
        } as Author;

        test('marshalls fields', async () => {
            expect(await authorMarshaller.marshall(toMarshall)).toStrictEqual({
                name: 'Bob Marley',
                email: 'bob@marley.com',
            } as TestPackageAuthor);
        });
    });
});
