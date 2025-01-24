import { Question } from '@renderer/db/models/question';
import { OptionMarshaller } from '@renderer/services/test-package-service/marshallers/option-marshaller';
import { QuestionMarshaller } from '@renderer/services/test-package-service/marshallers/question-marshaller';
import { Manifest } from '@renderer/services/test-package-service/model/manifest';
import { TestPackageQuestion } from '@renderer/services/test-package-service/model/test-package-question';
import JSZip from 'jszip';
import { beforeEach, describe, expect, Mock, test, vi } from 'vitest';
import { DeliveryDbFacade } from '@renderer/services/delivery-db-facade';

// Mock the DB
vi.mock('@renderer/services/delivery-db-facade.ts', () => ({
    DeliveryDbFacade: {
        questions: {
            add: vi.fn().mockImplementation(() => Promise.resolve()),
        },
    },
}));

describe('question marshaller', async () => {
    const optionMarshaller = {
        unmarshall: vi.fn(() => ({})),
        marshall: vi.fn(() => ({})),
    } as unknown as OptionMarshaller;

    let questionMarshaller = new QuestionMarshaller(
        {} as JSZip,
        DeliveryDbFacade,
        optionMarshaller,
        {} as unknown as Manifest,
    );

    beforeEach(() => {
        (optionMarshaller.unmarshall as Mock)?.mockClear();
        (optionMarshaller.marshall as Mock)?.mockClear();
    });

    describe('unmarshalls', () => {
        test('unmarshalls fields for MULTIPLE type', async () => {
            const toUnmarshall = {
                uuid: 'a3fad32ksdfa',
                type: 'MULTIPLE',
                title: 'Question #1',
                contentRef: 'd3afk32fdas',
                answer: 'a213fjkdad',
                options: [
                    {
                        uuid: 'a213fjkdad',
                        contentRefText: 'Mitochondria',
                        contentRef: 'some ref',
                        explanation: 'This is the right answer',
                    },
                    {
                        uuid: 'b23dffjkdad',
                        contentRef: 'Vacuole',
                        explanation: 'This is the wrong answer',
                    },
                ],
                successFeedbackText: 'Yay!',
                failureFeedbackText: 'Uh oh!',
                categories: ['example'],
            } as TestPackageQuestion;

            const unmarshalled = await questionMarshaller.unmarshall(toUnmarshall);

            expect(unmarshalled).toStrictEqual({
                uuid: 'a3fad32ksdfa',
                type: 'MULTIPLE',
                title: 'Question #1',
                contentRef: 'd3afk32fdas',
                dropZones: undefined,
                answer: 'a213fjkdad',
                options: [{}, {}],
                subjectImageRef: undefined,
                successFeedbackText: 'Yay!',
                failureFeedbackText: 'Uh oh!',
                successFeedbackRef: undefined,
                failureFeedbackRef: undefined,
                categories: ['example'],
            } as Question);

            expect(optionMarshaller.unmarshall).toHaveBeenCalledTimes(2);

            expect(DeliveryDbFacade.questions.add).toHaveBeenCalledWith(unmarshalled);
        });

        test('unmarshalls fields for MANY type', async () => {
            const toUnmarshall = {
                uuid: 'a3fad32ksdfa',
                type: 'MANY',
                title: 'Question #1',
                contentRef: 'd3afk32fdas',
                answer: ['a213fjkdad', 'sdcwfadjkdad'],
                options: [
                    {
                        uuid: 'a213fjkdad',
                        contentRef: 'some ref',
                        explanation: 'This is the right answer',
                    },
                    {
                        uuid: 'b23dffjkdad',
                        contentRef: 'some ref',
                        explanation: 'This is the wrong answer',
                    },
                    {
                        uuid: 'sdcwfadjkdad',
                        contentRef: 'some ref',
                        explanation: 'This is the wrong answer',
                    },
                ],
                successFeedbackText: 'Yay!',
                failureFeedbackText: 'Uh oh!',
                categories: ['example'],
            } as TestPackageQuestion;

            const unmarshalled = await questionMarshaller.unmarshall(toUnmarshall);

            expect(unmarshalled).toStrictEqual({
                uuid: 'a3fad32ksdfa',
                type: 'MANY',
                title: 'Question #1',
                contentRef: 'd3afk32fdas',
                dropZones: undefined,
                answer: ['a213fjkdad', 'sdcwfadjkdad'],
                options: [{}, {}, {}],
                subjectImageRef: undefined,
                successFeedbackText: 'Yay!',
                failureFeedbackText: 'Uh oh!',
                successFeedbackRef: undefined,
                failureFeedbackRef: undefined,
                categories: ['example'],
            } as Question);

            expect(optionMarshaller.unmarshall).toHaveBeenCalledTimes(3);

            expect(DeliveryDbFacade.questions.add).toHaveBeenCalledWith(unmarshalled);
        });

        test('unmarshalls fields for FILL type', async () => {
            const toUnmarshall = {
                uuid: 'a3fad32ksdfa',
                type: 'FILL',
                title: 'Question #1',
                contentRef: 'd3afk32fdas',
                answer: ['first blank', 'second blank', 'third blank'],
                options: [],
                successFeedbackText: 'Yay!',
                failureFeedbackText: 'Uh oh!',
                categories: ['engines'],
            } as TestPackageQuestion;

            expect(await questionMarshaller.unmarshall(toUnmarshall)).toStrictEqual({
                uuid: 'a3fad32ksdfa',
                type: 'FILL',
                title: 'Question #1',
                contentRef: 'd3afk32fdas',
                dropZones: undefined,
                answer: ['first blank', 'second blank', 'third blank'],
                options: [],
                subjectImageRef: undefined,
                successFeedbackText: 'Yay!',
                failureFeedbackText: 'Uh oh!',
                successFeedbackRef: undefined,
                failureFeedbackRef: undefined,
                categories: ['engines'],
            } as Question);
        });

        test('unmarshalls fields for TEXT type', async () => {
            const toUnmarshall = {
                uuid: 'a3fad32ksdfa',
                type: 'TEXT',
                title: 'Question #1',
                contentRef: 'd3afk32fdas',
                answer: 'blah blah blah',
                options: [],
                successFeedbackText: 'Yay!',
                failureFeedbackText: 'Uh oh!',
                categories: ['example'],
            } as TestPackageQuestion;

            const unmarshalled = await questionMarshaller.unmarshall(toUnmarshall);

            expect(unmarshalled).toStrictEqual({
                uuid: 'a3fad32ksdfa',
                type: 'TEXT',
                title: 'Question #1',
                contentRef: 'd3afk32fdas',
                dropZones: undefined,
                failureFeedbackRef: undefined,
                answer: 'blah blah blah',
                options: [],
                subjectImageRef: undefined,
                successFeedbackText: 'Yay!',
                failureFeedbackText: 'Uh oh!',
                successFeedbackRef: undefined,
                categories: ['example'],
            } as Question);

            expect(DeliveryDbFacade.questions.add).toHaveBeenCalledWith(unmarshalled);
        });

        test('unmarshalls fields for DRAGNDROP type', async () => {
            const toUnmarshall = {
                uuid: 'a3fad32ksdfa',
                type: 'DRAGNDROP',
                title: 'Question #1',
                contentRef: 'd3afk32fdas',
                answer: [
                    {
                        answer: 'answer1',
                        dropZone: {
                            x: 90,
                            y: 90,
                            width: 100,
                            height: 100,
                        },
                    },
                ],
                options: [],
                successFeedbackText: 'Yay!',
                failureFeedbackText: 'Uh oh!',
                categories: ['example'],
            } as TestPackageQuestion;

            const unmarshalled = await questionMarshaller.unmarshall(toUnmarshall);

            expect(unmarshalled).toStrictEqual({
                uuid: 'a3fad32ksdfa',
                type: 'DRAGNDROP',
                title: 'Question #1',
                contentRef: 'd3afk32fdas',
                dropZones: undefined,
                failureFeedbackRef: undefined,
                answer: [
                    {
                        answer: 'answer1',
                        dropZone: {
                            x: 90,
                            y: 90,
                            width: 100,
                            height: 100,
                        },
                    },
                ],
                options: [],
                subjectImageRef: undefined,
                successFeedbackText: 'Yay!',
                failureFeedbackText: 'Uh oh!',
                successFeedbackRef: undefined,
                categories: ['example'],
            } as Question);

            expect(DeliveryDbFacade.questions.add).toHaveBeenCalledWith(unmarshalled);
        });

        test('unmarshalls fields for HOTSPOT type', async () => {
            const toUnmarshall = {
                uuid: 'a3fad32ksdfa',
                type: 'HOTSPOT',
                title: 'Question #1',
                contentRef: 'd3afk32fdas',
                answer: [[{ x: 1, y: 2 }]],
                options: [],
                successFeedbackText: 'Yay!',
                failureFeedbackText: 'Uh oh!',
                categories: ['engines'],
            } as TestPackageQuestion;

            expect(await questionMarshaller.unmarshall(toUnmarshall)).toStrictEqual({
                uuid: 'a3fad32ksdfa',
                type: 'HOTSPOT',
                title: 'Question #1',
                contentRef: 'd3afk32fdas',
                dropZones: undefined,
                answer: [[{ x: 1, y: 2 }]],
                options: [],
                subjectImageRef: undefined,
                successFeedbackText: 'Yay!',
                failureFeedbackText: 'Uh oh!',
                successFeedbackRef: undefined,
                failureFeedbackRef: undefined,
                categories: ['engines'],
            } as Question);
        });

        test('unmarshalls fields for HOTAREA type', async () => {
            const toUnmarshall = {
                uuid: 'a3fad32ksdfa',
                type: 'HOTAREA',
                title: 'Question #1',
                contentRef: 'd3afk32fdas',
                answer: [
                    [
                        { x: 1, y: 2 },
                        { x: 3, y: 4 },
                    ],
                ],
                options: [],
                successFeedbackText: 'Yay!',
                failureFeedbackText: 'Uh oh!',
                categories: ['engines'],
            } as TestPackageQuestion;

            expect(await questionMarshaller.unmarshall(toUnmarshall)).toStrictEqual({
                uuid: 'a3fad32ksdfa',
                type: 'HOTAREA',
                title: 'Question #1',
                contentRef: 'd3afk32fdas',
                dropZones: undefined,
                answer: [
                    [
                        { x: 1, y: 2 },
                        { x: 3, y: 4 },
                    ],
                ],
                options: [],
                subjectImageRef: undefined,
                successFeedbackText: 'Yay!',
                failureFeedbackText: 'Uh oh!',
                successFeedbackRef: undefined,
                failureFeedbackRef: undefined,
                categories: ['engines'],
            } as Question);
        });
    });

    describe('marshalls', () => {
        test('marshalls fields for MULTIPLE type', async () => {
            const toMarshall = {
                uuid: 'a3fad32ksdfa',
                type: 'MULTIPLE',
                title: 'Question #1',
                contentRef: 'd3afk32fdas',
                answer: 'a213fjkdad',
                options: [
                    {
                        uuid: 'a213fjkdad',
                        contentRefText: 'Mitochondria',
                        contentRef: 'some ref',
                        explanation: 'This is the right answer',
                    },
                    {
                        uuid: 'b23dffjkdad',
                        contentRef: 'Vacuole',
                        explanation: 'This is the wrong answer',
                    },
                ],
                successFeedbackText: 'Yay!',
                failureFeedbackText: 'Uh oh!',
                categories: ['example'],
            } as Question;

            const marshalled = await questionMarshaller.marshall(toMarshall);

            expect(marshalled).toStrictEqual({
                uuid: 'a3fad32ksdfa',
                type: 'MULTIPLE',
                title: 'Question #1',
                contentRef: 'd3afk32fdas',
                dropZones: undefined,
                answer: 'a213fjkdad',
                options: [{}, {}],
                subjectImageRef: undefined,
                successFeedbackText: 'Yay!',
                failureFeedbackText: 'Uh oh!',
                successFeedbackRef: undefined,
                failureFeedbackRef: undefined,
                categories: ['example'],
            } as TestPackageQuestion);

            expect(optionMarshaller.marshall).toHaveBeenCalledTimes(2);
        });

        test('marshalls fields for MANY type', async () => {
            const toMarshall = {
                uuid: 'a3fad32ksdfa',
                type: 'MANY',
                title: 'Question #1',
                contentRef: 'd3afk32fdas',
                answer: ['a213fjkdad', 'sdcwfadjkdad'],
                options: [
                    {
                        uuid: 'a213fjkdad',
                        contentRef: 'some ref',
                        explanation: 'This is the right answer',
                    },
                    {
                        uuid: 'b23dffjkdad',
                        contentRef: 'some ref',
                        explanation: 'This is the wrong answer',
                    },
                    {
                        uuid: 'sdcwfadjkdad',
                        contentRef: 'some ref',
                        explanation: 'This is the wrong answer',
                    },
                ],
                successFeedbackText: 'Yay!',
                failureFeedbackText: 'Uh oh!',
                categories: ['example'],
            } as Question;

            const marshalled = await questionMarshaller.marshall(toMarshall);

            expect(marshalled).toStrictEqual({
                uuid: 'a3fad32ksdfa',
                type: 'MANY',
                title: 'Question #1',
                contentRef: 'd3afk32fdas',
                dropZones: undefined,
                answer: ['a213fjkdad', 'sdcwfadjkdad'],
                options: [{}, {}, {}],
                subjectImageRef: undefined,
                successFeedbackText: 'Yay!',
                failureFeedbackText: 'Uh oh!',
                successFeedbackRef: undefined,
                failureFeedbackRef: undefined,
                categories: ['example'],
            } as TestPackageQuestion);

            expect(optionMarshaller.marshall).toHaveBeenCalledTimes(3);
        });

        test('marshalls fields for FILL type', async () => {
            const toMarshall = {
                uuid: 'a3fad32ksdfa',
                type: 'FILL',
                title: 'Question #1',
                contentRef: 'd3afk32fdas',
                answer: ['first blank', 'second blank', 'third blank'],
                options: [],
                successFeedbackText: 'Yay!',
                failureFeedbackText: 'Uh oh!',
                categories: ['engines'],
            } as Question;

            const marshalled = await questionMarshaller.marshall(toMarshall);

            expect(marshalled).toStrictEqual({
                uuid: 'a3fad32ksdfa',
                type: 'FILL',
                title: 'Question #1',
                contentRef: 'd3afk32fdas',
                dropZones: undefined,
                answer: ['first blank', 'second blank', 'third blank'],
                options: [],
                subjectImageRef: undefined,
                successFeedbackText: 'Yay!',
                failureFeedbackText: 'Uh oh!',
                successFeedbackRef: undefined,
                failureFeedbackRef: undefined,
                categories: ['engines'],
            } as TestPackageQuestion);
        });

        test('marshalls fields for TEXT type', async () => {
            const toMarshall = {
                uuid: 'a3fad32ksdfa',
                type: 'TEXT',
                title: 'Question #1',
                contentRef: 'd3afk32fdas',
                answer: 'blah blah blah',
                options: [],
                successFeedbackText: 'Yay!',
                failureFeedbackText: 'Uh oh!',
                categories: ['example'],
            } as Question;

            const marshalled = await questionMarshaller.marshall(toMarshall);

            expect(marshalled).toStrictEqual({
                uuid: 'a3fad32ksdfa',
                type: 'TEXT',
                title: 'Question #1',
                contentRef: 'd3afk32fdas',
                dropZones: undefined,
                failureFeedbackRef: undefined,
                answer: 'blah blah blah',
                options: [],
                subjectImageRef: undefined,
                successFeedbackText: 'Yay!',
                failureFeedbackText: 'Uh oh!',
                successFeedbackRef: undefined,
                categories: ['example'],
            } as TestPackageQuestion);
        });

        test('marshalls fields for DRAGNDROP type', async () => {
            const toMarshall = {
                uuid: 'a3fad32ksdfa',
                type: 'DRAGNDROP',
                title: 'Question #1',
                contentRef: 'd3afk32fdas',
                answer: [
                    {
                        answer: 'answer1',
                        dropZone: {
                            x: 90,
                            y: 90,
                            width: 100,
                            height: 100,
                        },
                    },
                ],
                options: [],
                successFeedbackText: 'Yay!',
                failureFeedbackText: 'Uh oh!',
                categories: ['example'],
            } as Question;

            const marshalled = await questionMarshaller.marshall(toMarshall);

            expect(marshalled).toStrictEqual({
                uuid: 'a3fad32ksdfa',
                type: 'DRAGNDROP',
                title: 'Question #1',
                contentRef: 'd3afk32fdas',
                dropZones: undefined,
                failureFeedbackRef: undefined,
                answer: [
                    {
                        answer: 'answer1',
                        dropZone: {
                            x: 90,
                            y: 90,
                            width: 100,
                            height: 100,
                        },
                    },
                ],
                options: [],
                subjectImageRef: undefined,
                successFeedbackText: 'Yay!',
                failureFeedbackText: 'Uh oh!',
                successFeedbackRef: undefined,
                categories: ['example'],
            } as TestPackageQuestion);
        });

        test('marshalls fields for HOTSPOT type', async () => {
            const toMarshall = {
                uuid: 'a3fad32ksdfa',
                type: 'HOTSPOT',
                title: 'Question #1',
                contentRef: 'd3afk32fdas',
                answer: [[{ x: 1, y: 2 }]],
                options: [],
                successFeedbackText: 'Yay!',
                failureFeedbackText: 'Uh oh!',
                categories: ['engines'],
            } as Question;

            expect(await questionMarshaller.unmarshall(toMarshall)).toStrictEqual({
                uuid: 'a3fad32ksdfa',
                type: 'HOTSPOT',
                title: 'Question #1',
                contentRef: 'd3afk32fdas',
                dropZones: undefined,
                answer: [[{ x: 1, y: 2 }]],
                options: [],
                subjectImageRef: undefined,
                successFeedbackText: 'Yay!',
                failureFeedbackText: 'Uh oh!',
                successFeedbackRef: undefined,
                failureFeedbackRef: undefined,
                categories: ['engines'],
            } as TestPackageQuestion);
        });

        test('marshalls fields for HOTAREA type', async () => {
            const toMarshall = {
                uuid: 'a3fad32ksdfa',
                type: 'HOTAREA',
                title: 'Question #1',
                contentRef: 'd3afk32fdas',
                answer: [
                    [
                        { x: 1, y: 2 },
                        { x: 3, y: 4 },
                    ],
                ],
                options: [],
                successFeedbackText: 'Yay!',
                failureFeedbackText: 'Uh oh!',
                categories: ['engines'],
            } as Question;

            expect(await questionMarshaller.marshall(toMarshall)).toStrictEqual({
                uuid: 'a3fad32ksdfa',
                type: 'HOTAREA',
                title: 'Question #1',
                contentRef: 'd3afk32fdas',
                dropZones: undefined,
                answer: [
                    [
                        { x: 1, y: 2 },
                        { x: 3, y: 4 },
                    ],
                ],
                options: [],
                subjectImageRef: undefined,
                successFeedbackText: 'Yay!',
                failureFeedbackText: 'Uh oh!',
                successFeedbackRef: undefined,
                failureFeedbackRef: undefined,
                categories: ['engines'],
            } as TestPackageQuestion);
        });
    });
});
