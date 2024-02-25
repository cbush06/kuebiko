import { KuebikoDb } from '@renderer/db/kuebiko-db';
import { Question } from '@renderer/db/models/question';
import { OptionMarshaller } from '@renderer/services/test-package-service/marshallers/option-marshaller';
import { QuestionMarshaller } from '@renderer/services/test-package-service/marshallers/question-marshaller';
import { Manifest } from '@renderer/services/test-package-service/model/manifest';
import { TestPackageQuestion } from '@renderer/services/test-package-service/model/test-package-question';
import JSZip from 'jszip';
import { Mock, beforeEach, describe, expect, test, vi } from 'vitest';

// Mock the DB
vi.mock('@renderer/db/kuebiko-db.ts', () => {
    const KuebikoDb = vi.fn();
    KuebikoDb.prototype.questions = {
        add: vi.fn().mockImplementation(() => Promise.resolve()),
    };
    return {
        KuebikoDb: KuebikoDb,
    };
});

describe('question marshaller', async () => {
    const kuebikoDb = new KuebikoDb();

    const optionMarshaller = {
        unmarshall: vi.fn(() => ({})),
    } as unknown as OptionMarshaller;

    let questionMarshaller = new QuestionMarshaller({} as JSZip, {} as unknown as Manifest, kuebikoDb, optionMarshaller);

    beforeEach(() => {
        (optionMarshaller.unmarshall as Mock).mockClear();
    });

    test('unmarshalls fields for TEXT type', async () => {
        const toUnmarshal = {
            uuid: 'a3fad32ksdfa',
            type: 'TEXT',
            contentRef: 'd3afk32fdas',
            answer: 'blah blah blah',
            options: [],
            successFeedbackText: 'Yay!',
            failureFeedbackText: 'Uh oh!',
            categories: ['example'],
        } as TestPackageQuestion;

        const unmarshalled = await questionMarshaller.unmarshall(toUnmarshal);

        expect(unmarshalled).toStrictEqual({
            uuid: 'a3fad32ksdfa',
            type: 'TEXT',
            contentText: undefined,
            contentRef: 'd3afk32fdas',
            answer: 'blah blah blah',
            options: [],
            successFeedbackText: 'Yay!',
            failureFeedbackText: 'Uh oh!',
            successFeedbackRef: undefined,
            failureFeedbackRef: undefined,
            categories: ['example'],
        } as Question);

        expect(kuebikoDb.questions.add).toHaveBeenCalledWith(unmarshalled);
    });

    test('unmarshalls fields for MULTIPLE type', async () => {
        const toUnmarshal = {
            uuid: 'a3fad32ksdfa',
            type: 'MULTIPLE',
            contentRef: 'd3afk32fdas',
            answer: 'a213fjkdad',
            options: [
                {
                    uuid: 'a213fjkdad',
                    contentText: 'Mitochondria',
                    contentRef: 'some ref',
                    explanation: 'This is the right answer',
                },
                {
                    uuid: 'b23dffjkdad',
                    contentText: 'Vacuole',
                    contentRef: 'some ref',
                    explanation: 'This is the wrong answer',
                },
            ],
            successFeedbackText: 'Yay!',
            failureFeedbackText: 'Uh oh!',
            categories: ['example'],
        } as TestPackageQuestion;

        const unmarshalled = await questionMarshaller.unmarshall(toUnmarshal);

        expect(unmarshalled).toStrictEqual({
            uuid: 'a3fad32ksdfa',
            type: 'MULTIPLE',
            contentText: undefined,
            contentRef: 'd3afk32fdas',
            answer: 'a213fjkdad',
            options: [{}, {}],
            successFeedbackText: 'Yay!',
            failureFeedbackText: 'Uh oh!',
            successFeedbackRef: undefined,
            failureFeedbackRef: undefined,
            categories: ['example'],
        } as Question);

        expect(optionMarshaller.unmarshall).toHaveBeenCalledTimes(2);

        expect(kuebikoDb.questions.add).toHaveBeenCalledWith(unmarshalled);
    });

    test('unmarshalls fields for MANY type', async () => {
        const toUnmarshal = {
            uuid: 'a3fad32ksdfa',
            type: 'MANY',
            contentRef: 'd3afk32fdas',
            answer: ['a213fjkdad', 'sdcwfadjkdad'],
            options: [
                {
                    uuid: 'a213fjkdad',
                    contentText: 'A',
                    contentRef: 'some ref',
                    explanation: 'This is the right answer',
                },
                {
                    uuid: 'b23dffjkdad',
                    contentText: 'B',
                    contentRef: 'some ref',
                    explanation: 'This is the wrong answer',
                },
                {
                    uuid: 'sdcwfadjkdad',
                    contentText: 'E',
                    contentRef: 'some ref',
                    explanation: 'This is the wrong answer',
                },
            ],
            successFeedbackText: 'Yay!',
            failureFeedbackText: 'Uh oh!',
            categories: ['example'],
        } as TestPackageQuestion;

        const unmarshalled = await questionMarshaller.unmarshall(toUnmarshal);

        expect(unmarshalled).toStrictEqual({
            uuid: 'a3fad32ksdfa',
            type: 'MANY',
            contentText: undefined,
            contentRef: 'd3afk32fdas',
            answer: ['a213fjkdad', 'sdcwfadjkdad'],
            options: [{}, {}, {}],
            successFeedbackText: 'Yay!',
            failureFeedbackText: 'Uh oh!',
            successFeedbackRef: undefined,
            failureFeedbackRef: undefined,
            categories: ['example'],
        } as Question);

        expect(optionMarshaller.unmarshall).toHaveBeenCalledTimes(3);

        expect(kuebikoDb.questions.add).toHaveBeenCalledWith(unmarshalled);
    });

    test('unmarshalls fields for POINT type', async () => {
        const toUnmarshal = {
            uuid: 'a3fad32ksdfa',
            type: 'POINT',
            contentRef: 'd3afk32fdas',
            answer: [{ x: 1, y: 2 }],
            options: [],
            successFeedbackText: 'Yay!',
            failureFeedbackText: 'Uh oh!',
            categories: ['engines'],
        } as TestPackageQuestion;

        expect(await questionMarshaller.unmarshall(toUnmarshal)).toStrictEqual({
            uuid: 'a3fad32ksdfa',
            type: 'POINT',
            contentText: undefined,
            contentRef: 'd3afk32fdas',
            answer: [{ x: 1, y: 2 }],
            options: [],
            successFeedbackText: 'Yay!',
            failureFeedbackText: 'Uh oh!',
            successFeedbackRef: undefined,
            failureFeedbackRef: undefined,
            categories: ['engines'],
        } as Question);
    });

    test('unmarshalls fields for POINT[] type', async () => {
        const toUnmarshal = {
            uuid: 'a3fad32ksdfa',
            type: 'FILL',
            contentRef: 'd3afk32fdas',
            answer: [
                { x: 1, y: 2 },
                { x: 3, y: 4 },
            ],
            options: [],
            successFeedbackText: 'Yay!',
            failureFeedbackText: 'Uh oh!',
            categories: ['engines'],
        } as TestPackageQuestion;

        expect(await questionMarshaller.unmarshall(toUnmarshal)).toStrictEqual({
            uuid: 'a3fad32ksdfa',
            type: 'FILL',
            contentText: undefined,
            contentRef: 'd3afk32fdas',
            answer: [
                { x: 1, y: 2 },
                { x: 3, y: 4 },
            ],
            options: [],
            successFeedbackText: 'Yay!',
            failureFeedbackText: 'Uh oh!',
            successFeedbackRef: undefined,
            failureFeedbackRef: undefined,
            categories: ['engines'],
        } as Question);
    });
});
