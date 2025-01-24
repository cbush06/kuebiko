import { AnswerType } from '@renderer/db/models/answer';
import { Question, QuestionType } from '@renderer/db/models/question';
import JSZip from 'jszip';
import { MarshallingDbError } from '../errors/marshalling-db-error';
import { Manifest } from '../model/manifest';
import { TestPackageAnswerType } from '../model/test-package-answer';
import { TestPackageQuestion, TestPackageQuestionType } from '../model/test-package-question';
import { AbstractMarshaller } from './abstract-marshaller';
import { OptionMarshaller } from './option-marshaller';
import { KuebikoDbFacade } from '@renderer/services/kuebiko-db-facade';
import { TestPackageRectangle } from '@renderer/services/test-package-service/model/test-package-rectangle';
import { Rectangle } from '@renderer/db/models/rectangle';

export class QuestionMarshaller extends AbstractMarshaller<Question, TestPackageQuestion> {
    constructor(
        protected jszip: JSZip,
        protected db: KuebikoDbFacade,
        protected optionMarshaller: OptionMarshaller,
        protected manifest?: Manifest,
    ) {
        super(jszip, db, manifest);
    }

    async marshall(o: Question): Promise<TestPackageQuestion> {
        const marshalledType = o.type as TestPackageQuestionType;
        let marshalledAnswer = o.answer as TestPackageAnswerType;

        const marshalledOptions = await Promise.all(
            o.options.map((o) => this.optionMarshaller.marshall(o)),
        );

        const q = {
            uuid: o.uuid,
            type: marshalledType,
            title: o.title,
            contentRef: o.contentRef,
            subjectImageRef: o.subjectImageRef,
            dropZones: o.dropZones as TestPackageRectangle[],
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
        let marshalledAnswer = o.answer as AnswerType;

        const marshalledOptions = await Promise.all(
            o.options.map((opt) => this.optionMarshaller.unmarshall(opt)),
        );

        const q = {
            uuid: o.uuid,
            type: marshalledType,
            title: o.title,
            contentRef: o.contentRef,
            subjectImageRef: o.subjectImageRef,
            dropZones: o.dropZones as Rectangle[],
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
