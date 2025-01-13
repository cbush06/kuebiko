import { KuebikoDb } from '@renderer/db/kuebiko-db';
import { Section } from '@renderer/db/models/section';
import JSZip from 'jszip';
import { Manifest } from '../model/manifest';
import { TestPackageSection } from '../model/test-package-section';
import { AbstractMarshaller } from './abstract-marshaller';
import { QuestionMarshaller } from './question-marshaller';

export class SectionMarshaller extends AbstractMarshaller<Section, TestPackageSection> {
    constructor(
        protected jszip: JSZip,
        protected manifest: Manifest,
        protected db: KuebikoDb,
        protected questionMarshaller: QuestionMarshaller,
    ) {
        super(jszip, manifest, db);
    }

    async marshal(o: Section): Promise<TestPackageSection> {
        const questionEntities = await this.db.questions.bulkGet(o.questionRefs);
        const questions = await Promise.all(
            questionEntities
                .filter((q) => !!q)
                .map(async (q) => await this.questionMarshaller.marshal(q)),
        );

        return {
            uuid: o.uuid,
            default: o.default,
            title: o.title,
            questions,
            descriptionRef: o.descriptionRef,
        } as TestPackageSection;
    }

    async unmarshall(o: TestPackageSection): Promise<Section> {
        // Unmarshal the questions
        const questions = await Promise.all(
            o.questions.map(async (q) => await this.questionMarshaller.unmarshall(q)),
        );

        return {
            uuid: o.uuid,
            default: o.default,
            title: o.title,
            descriptionRef: o.descriptionRef,
            questionRefs: questions.map((q) => q.uuid),
        } as Section;
    }
}
