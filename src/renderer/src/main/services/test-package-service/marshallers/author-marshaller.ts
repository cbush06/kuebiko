import { Author } from '@renderer/db/models/author';
import { TestPackageAuthor } from '../model/test-package-author';
import { AbstractMarshaller } from './abstract-marshaller';

export class AuthorMarshaller extends AbstractMarshaller<Author, TestPackageAuthor> {
    async marshall(o: Author): Promise<TestPackageAuthor> {
        return Promise.resolve({
            name: o.name,
            email: o.email,
        } as TestPackageAuthor);
    }

    async unmarshall(o: TestPackageAuthor): Promise<Author> {
        return Promise.resolve({
            name: o.name,
            email: o.email,
        } as Author);
    }
}
