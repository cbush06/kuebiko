import { KuebikoDb } from '@renderer/db/kuebiko-db';
import { Author } from '@renderer/db/models/author';
import { AuthorMarshaller } from '@renderer/services/test-package-service/marshallers/author-marshaller';
import { Manifest } from '@renderer/services/test-package-service/model/manifest';
import { TestPackageAuthor } from '@renderer/services/test-package-service/model/test-package-author';
import JSZip from 'jszip';
import { describe, expect, test } from 'vitest';

describe('author marshaller', async () => {
    let authorMarshaller = new AuthorMarshaller({} as JSZip, {} as unknown as Manifest, {} as KuebikoDb);
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
