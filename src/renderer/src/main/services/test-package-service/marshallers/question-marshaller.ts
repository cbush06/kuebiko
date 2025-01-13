import { KuebikoDb } from '@renderer/db/kuebiko-db';
import { AnswerType } from '@renderer/db/models/answer';
import { Point } from '@renderer/db/models/point';
import { Question, QuestionType } from '@renderer/db/models/question';
import JSZip from 'jszip';
import { MarshallingDbError } from '../errors/marshalling-db-error';
import { Manifest } from '../model/manifest';
import { TestPackageAnswerType } from '../model/test-package-answer';
import { TestPackagePoint } from '../model/test-package-point';
import { TestPackageQuestion, TestPackageQuestionType } from '../model/test-package-question';
import { AbstractMarshaller } from './abstract-marshaller';
import { OptionMarshaller } from './option-marshaller';

export class QuestionMarshaller extends AbstractMarshaller<Question, TestPackageQuestion> {
    constructor(
        protected jszip: JSZip,
        protected manifest: Manifest,
        protected db: KuebikoDb,
        protected optionMarshaller: OptionMarshaller,
    ) {
        super(jszip, manifest, db);
    }

    async marshal(o: Question): Promise<TestPackageQuestion> {
        const marshalledType = o.type as TestPackageQuestionType;
        let marshalledAnswer: TestPackageAnswerType;
        let marshalledDropZones: TestPackagePoint[] | undefined;

        if (o.type === 'POINT' || o.type === 'HOTAREA') {
            const points = (o.answer ?? []) as Point[];
            marshalledAnswer = points.map(
                (p) =>
                    ({
                        x: p.x,
                        y: p.y,
                    }) as TestPackagePoint,
            );
        } else {
            marshalledAnswer = o.answer as string | string[];
        }

        if (o.type === 'DRAGNDROP') {
            marshalledDropZones = (o.dropZones ?? []).map(
                (p) =>
                    ({
                        x: p.x,
                        y: p.y,
                    }) as TestPackagePoint,
            );
        }

        const marshalledOptions = await Promise.all(
            o.options.map((o) => this.optionMarshaller.marshal(o)),
        );

        const q = {
            uuid: o.uuid,
            type: marshalledType,
            title: o.title,
            contentRef: o.contentRef,
            subjectImageRef: o.subjectImageRef,
            dropZones: marshalledDropZones,
            answer: marshalledAnswer,
            options: marshalledOptions,
            successFeedbackText: o.successFeedbackText,
            successFeedbackRef: o.successFeedbackRef,
            failureFeedbackText: o.failureFeedbackText,
            failureFeedbackRef: o.failureFeedbackRef,
            categories: o.categories,
        } as TestPackageQuestion;

        return q;
    }

    async unmarshall(o: TestPackageQuestion): Promise<Question> {
        const marshalledType = o.type as QuestionType;
        let marshalledAnswer: AnswerType;
        let marshalledDropZones: Point[] | undefined;

        if (o.type === 'POINT' || o.type === 'HOTAREA') {
            const testPackagePoints = (o.answer ?? []) as TestPackagePoint[];
            marshalledAnswer = testPackagePoints.map(
                (p) =>
                    ({
                        x: p.x,
                        y: p.y,
                    }) as Point,
            );
        } else {
            marshalledAnswer = o.answer as string | string[];
        }

        if (o.type === 'DRAGNDROP') {
            marshalledDropZones = (o.dropZones ?? []).map(
                (p) =>
                    ({
                        x: p.x,
                        y: p.y,
                    }) as Point,
            );
        }

        const marshalledOptions = await Promise.all(
            o.options.map((opt) => this.optionMarshaller.unmarshall(opt)),
        );

        const q = {
            uuid: o.uuid,
            type: marshalledType,
            title: o.title,
            contentRef: o.contentRef,
            subjectImageRef: o.subjectImageRef,
            dropZones: marshalledDropZones,
            answer: marshalledAnswer,
            options: marshalledOptions,
            successFeedbackRef: o.successFeedbackRef,
            successFeedbackText: o.successFeedbackText,
            failureFeedbackRef: o.failureFeedbackRef,
            failureFeedbackText: o.failureFeedbackText,
            categories: o.categories,
        } as Question;

        try {
            await this.db.questions.add(q);
        } catch (e) {
            throw new MarshallingDbError(
                `Failed to write object of type [Question] with UUID [${q.uuid}] to the database: ${e}`,
            );
        }

        return q;
    }
}
