import { Question } from '@renderer/db/models/question';
import { KuebikoDb } from '@renderer/db/kuebiko-db';
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

    test('unmarshalls fields for LONG type', async () => {
        const toUnmarshal = {
            uuid: 'a3fad32ksdfa',
            type: 'LONG',
            contentRef: 'd3afk32fdas',
            answer: 'blah blah blah',
            options: [],
            successFeedback: 'Yay!',
            failureFeedback: 'Uh oh!',
            categories: ['example'],
        } as TestPackageQuestion;

        const unmarshalled = await questionMarshaller.unmarshall(toUnmarshal);

        expect(unmarshalled).toStrictEqual({
            uuid: 'a3fad32ksdfa',
            type: 'LONG',
            contentText: undefined,
            contentRef: 'd3afk32fdas',
            answer: 'blah blah blah',
            options: [],
            successFeedback: 'Yay!',
            failureFeedback: 'Uh oh!',
            categories: ['example'],
        } as Question);

        expect(kuebikoDb.questions.add).toHaveBeenCalledWith(unmarshalled);
    });

    test('unmarshalls fields for SHORT type', async () => {
        const toUnmarshal = {
            uuid: 'a3fad32ksdfa',
            type: 'SHORT',
            contentRef: 'd3afk32fdas',
            answer: 'Chloroplasts',
            options: [],
            successFeedback: 'Yay!',
            failureFeedback: 'Uh oh!',
            categories: ['example'],
        } as TestPackageQuestion;

        expect(await questionMarshaller.unmarshall(toUnmarshal)).toStrictEqual({
            uuid: 'a3fad32ksdfa',
            type: 'SHORT',
            contentText: undefined,
            contentRef: 'd3afk32fdas',
            answer: 'Chloroplasts',
            options: [],
            successFeedback: 'Yay!',
            failureFeedback: 'Uh oh!',
            categories: ['example'],
        } as Question);
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
            successFeedback: 'Yay!',
            failureFeedback: 'Uh oh!',
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
            successFeedback: 'Yay!',
            failureFeedback: 'Uh oh!',
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
            successFeedback: 'Yay!',
            failureFeedback: 'Uh oh!',
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
            successFeedback: 'Yay!',
            failureFeedback: 'Uh oh!',
            categories: ['example'],
        } as Question);

        expect(optionMarshaller.unmarshall).toHaveBeenCalledTimes(3);

        expect(kuebikoDb.questions.add).toHaveBeenCalledWith(unmarshalled);
    });

    test('unmarshalls fields for MANY type', async () => {
        const toUnmarshal = {
            uuid: 'a3fad32ksdfa',
            type: 'FILL',
            contentRef: 'd3afk32fdas',
            answer: ['score', 'seven'],
            options: [],
            successFeedback: 'Yay!',
            failureFeedback: 'Uh oh!',
            categories: ['lincoln'],
        } as TestPackageQuestion;

        expect(await questionMarshaller.unmarshall(toUnmarshal)).toStrictEqual({
            uuid: 'a3fad32ksdfa',
            type: 'FILL',
            contentText: undefined,
            contentRef: 'd3afk32fdas',
            answer: ['score', 'seven'],
            options: [],
            successFeedback: 'Yay!',
            failureFeedback: 'Uh oh!',
            categories: ['lincoln'],
        } as Question);
    });

    test('unmarshalls fields for POINT type', async () => {
        const toUnmarshal = {
            uuid: 'a3fad32ksdfa',
            type: 'FILL',
            contentRef: 'd3afk32fdas',
            answer: { x: 1, y: 2 },
            options: [],
            successFeedback: 'Yay!',
            failureFeedback: 'Uh oh!',
            categories: ['engines'],
        } as TestPackageQuestion;

        expect(await questionMarshaller.unmarshall(toUnmarshal)).toStrictEqual({
            uuid: 'a3fad32ksdfa',
            type: 'FILL',
            contentText: undefined,
            contentRef: 'd3afk32fdas',
            answer: { x: 1, y: 2 },
            options: [],
            successFeedback: 'Yay!',
            failureFeedback: 'Uh oh!',
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
            successFeedback: 'Yay!',
            failureFeedback: 'Uh oh!',
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
            successFeedback: 'Yay!',
            failureFeedback: 'Uh oh!',
            categories: ['engines'],
        } as Question);
    });
});
