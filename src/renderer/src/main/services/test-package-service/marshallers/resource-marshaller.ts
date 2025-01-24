import { Resource, ResourceType } from '@renderer/db/models/resource';
import { InvalidResourceHashError } from '../errors/invalid-resource-hash-error';
import { MarshallingDbError } from '../errors/marshalling-db-error';
import { MissingReferenceError } from '../errors/missing-reference-error';
import { TestPackageResource } from '../model/test-package-resource';
import { AbstractMarshaller } from './abstract-marshaller';

export class ResourceMarshaller extends AbstractMarshaller<Resource, TestPackageResource> {
    async marshall(o: Resource): Promise<TestPackageResource> {
        this.jszip.file(o.name, o.data);

        return Promise.resolve({
            mime: o.mime,
            name: o.name,
            type: o.type,
            uuid: o.uuid,
            sha256: globalThis.kuebikoAPI.sha256(o.data),
        } as TestPackageResource);
    }

    async unmarshall(o: TestPackageResource): Promise<Resource> {
        const zipObj = this.jszip.files[o.name];

        if (!zipObj) {
            throw new MissingReferenceError(o.uuid, o.type);
        }

        let content: string | Uint8Array;
        switch (o.type) {
            case 'AUDIO':
            case 'IMAGE':
            case 'VIDEO':
                content = await zipObj.async('uint8array');
            case 'MARKDOWN':
                content = await zipObj.async('string');
        }

        const hash = globalThis.kuebikoAPI.sha256(content);

        if (o.sha256 !== hash) {
            throw new InvalidResourceHashError(o.name, o.uuid);
        }

        const r = {
            uuid: o.uuid,
            name: o.name,
            type: o.type as ResourceType,
            mime: o.mime,
            sha256: hash,
            data: content,
        } as Resource;

        try {
            await this.db.resources.add(r);
        } catch (e) {
            throw new MarshallingDbError(
                `Failed to write object of type [Resource] with UUID [${r.uuid}] to the database: ${e}`,
            );
        }

        return r;
    }
}
