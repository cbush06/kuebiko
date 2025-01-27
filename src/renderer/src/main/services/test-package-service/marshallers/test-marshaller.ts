import { Test } from '@renderer/db/models/test';
import JSZip from 'jszip';
import { MarshallingDbError } from '../errors/marshalling-db-error';
import { Manifest } from '../model/manifest';
import { AbstractMarshaller } from './abstract-marshaller';
import { AuthorMarshaller } from './author-marshaller';
import { ResourceMarshaller } from './resource-marshaller';
import { SectionMarshaller } from './section-marshaller';
import { KuebikoDbFacade } from '@renderer/services/kuebiko-db-facade';

export class TestMarshaller extends AbstractMarshaller<Test, Manifest> {
    constructor(
        protected jszip: JSZip,
        protected db: KuebikoDbFacade,
        protected authorMarshaller: AuthorMarshaller,
        protected resourceMarshaller: ResourceMarshaller,
        protected sectionMarshaller: SectionMarshaller,
        protected manifest?: Manifest,
    ) {
        super(jszip, db, manifest);
    }

    async marshall(o: Test): Promise<Manifest> {
        const authors = await Promise.all(o.authors.map((a) => this.authorMarshaller.marshall(a)));
        const resources = await Promise.all(
            (await this.db.resources.bulkGet(o.resourceRefs))
                .filter((r) => !!r)
                .map((r) => this.resourceMarshaller.marshall(r)),
        );
        const sections = await Promise.all(
            o.sections.map((s) => this.sectionMarshaller.marshall(s)),
        );

        return {
            uuid: o.uuid,
            title: o.title,
            version: o.version,
            descriptionRef: o.descriptionRef,
            authors,
            created: o.created.toISOString(),
            resources,
            sections,
            tags: o.tags,
            allowedTime: o.allowedTime,
        };
    }

    async unmarshall(o: Manifest): Promise<Test> {
        const authors = await Promise.all(
            o.authors.map((a) => this.authorMarshaller.unmarshall(a)),
        );
        const resources = await Promise.all(
            o.resources.map((r) => this.resourceMarshaller.unmarshall(r)),
        );
        const sections = await Promise.all(
            o.sections.map((s) => this.sectionMarshaller.unmarshall(s)),
        );

        const t = {
            uuid: o.uuid,
            title: o.title,
            version: o.version,
            descriptionRef: o.descriptionRef,
            authors,
            created: new Date(o.created),
            resourceRefs: resources.map((r) => r.uuid),
            sections,
            tags: o.tags,
            allowedTime: o.allowedTime,
        } as Test;

        try {
            await this.db.tests.add(t);
        } catch (e) {
            throw new MarshallingDbError(
                `Failed to write object of type [Test] with UUID [${t.uuid}] to the database: ${e}`,
            );
        }

        return t;
    }
}
