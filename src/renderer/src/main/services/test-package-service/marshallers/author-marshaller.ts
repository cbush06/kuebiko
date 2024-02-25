import { Author } from '@renderer/db/models/author';
import { TestPackageAuthor } from '../model/test-package-author';
import { AbstractMarshaller } from './abstract-marshaller';

export class AuthorMarshaller extends AbstractMarshaller<Author, TestPackageAuthor> {
    marshal(o: Author): Promise<TestPackageAuthor> {
        throw new Error('Method not implemented.');
    }

    unmarshall(o: TestPackageAuthor): Promise<Author> {
        return Promise.resolve({
            name: o.name,
            email: o.email,
        } as Author);
    }
}
