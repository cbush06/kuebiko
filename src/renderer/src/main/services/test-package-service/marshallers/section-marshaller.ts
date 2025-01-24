import { Section } from '@renderer/db/models/section';
import JSZip from 'jszip';
import { Manifest } from '../model/manifest';
import { TestPackageSection } from '../model/test-package-section';
import { AbstractMarshaller } from './abstract-marshaller';
import { QuestionMarshaller } from './question-marshaller';
import { KuebikoDbFacade } from '@renderer/services/kuebiko-db-facade';

export class SectionMarshaller extends AbstractMarshaller<Section, TestPackageSection> {
    constructor(
        protected jszip: JSZip,
        protected db: KuebikoDbFacade,
        protected questionMarshaller: QuestionMarshaller,
        protected manifest?: Manifest,
    ) {
        super(jszip, db, manifest);
    }

    async marshall(o: Section): Promise<TestPackageSection> {
        const questionEntities = await this.db.questions.bulkGet(o.questionRefs);
        const questions = await Promise.all(
            questionEntities
                .filter((q) => !!q)
                .map(async (q) => await this.questionMarshaller.marshall(q)),
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
