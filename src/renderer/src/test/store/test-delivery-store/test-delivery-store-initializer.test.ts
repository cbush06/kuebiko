import { Question } from '@renderer/db/models/question';
import { Section } from '@renderer/db/models/section';
import { AbstractDeliveryItem } from '@renderer/store/test-delivery-store/delivery-item/abstract-delivery-item';
import { QuestionDeliveryItem } from '@renderer/store/test-delivery-store/delivery-item/question-delivery-item';
import { SectionDeliveryItem } from '@renderer/store/test-delivery-store/delivery-item/section-delivery-item';
import { TestDeliveryStoreInitializer } from '@renderer/store/test-delivery-store/test-delivery-store-initializer';
import { afterEach, describe, expect, test, vi } from 'vitest';
import questionFactory from '../../factories/question-factory';
import testFactory from '../../factories/test-factory';

// Mock the DB
vi.mock('@renderer/db/kuebiko-db.ts', () => {
    const kuebikoDb = vi.fn();
    kuebikoDb.prototype.questions = {
        where: () => ({
            anyOf: () => ({
                toArray: vi.fn().mockImplementation(() => Promise.resolve([])),
            }),
        }),
    };
    kuebikoDb['INSTANCE'] = new kuebikoDb();
    return {
        kuebikoDb,
    };
});

describe('test delivery store initializer', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    test('buildAttempt', () => {
        const test = testFactory.build();
        const attempt = TestDeliveryStoreInitializer['buildAttempt'](test, 'PREPARE');

        expect(attempt).toMatchObject({
            testRef: test.uuid,
            status: 'INPROGRESS',
            score: 0,
            format: 'PREPARE',
        });

        expect(attempt.uuid).toBeTruthy();
        expect(attempt.questionResponses).toBeDefined();
    });

    const deliveryItemToUuidMapper = (d: AbstractDeliveryItem) => {
        if (d instanceof SectionDeliveryItem) {
            return d.getModel().uuid;
        } else if (d instanceof QuestionDeliveryItem) {
            return d.getModel().questionRef;
        } else {
            return undefined;
        }
    };

    test('buildInOriginalOrder default section', () => {
        const test = testFactory.build({}, { defaultSection: true });
        const attempt = TestDeliveryStoreInitializer['buildAttempt'](test, 'PREPARE');
        const questions = {
            get: vi.fn().mockImplementation(() => test.sections[0].questionRefs.map((q) => questionFactory.build({ uuid: q }))),
        } as unknown as Map<Section, Question[]>;

        // prettier-ignore
        const expectedDeliveryItemUuids = [
            test.sections[0].uuid,
            ...test.sections[0].questionRefs
        ];
        const actualDeliveryItemUuids = TestDeliveryStoreInitializer['buildInOriginalOrder'](test, attempt, questions).map((d) => deliveryItemToUuidMapper(d));

        expect(expectedDeliveryItemUuids).toEqual(actualDeliveryItemUuids);
    });

    test('buildInOriginalOrder multiple sections', () => {
        const test = testFactory.build({}, { defaultSection: false });
        const attempt = TestDeliveryStoreInitializer['buildAttempt'](test, 'PREPARE');
        const questions = {
            get: vi.fn().mockImplementation((s: Section) => s.questionRefs.map((q) => questionFactory.build({ uuid: q }))),
        } as unknown as Map<Section, Question[]>;

        // prettier-ignore
        const expectedDeliveryItemUuids = test.sections.flatMap(s => [
            s.uuid,
            ...s.questionRefs
        ]);
        const actualDeliveryItemUuids = TestDeliveryStoreInitializer['buildInOriginalOrder'](test, attempt, questions).map((d) => deliveryItemToUuidMapper(d));

        expect(actualDeliveryItemUuids).toEqual(expectedDeliveryItemUuids);
    });

    test('buildInRandomOrder default section all', () => {
        const test = testFactory.build({}, { defaultSection: true, questionsPerSection: 10 });
        const attempt = TestDeliveryStoreInitializer['buildAttempt'](test, 'PREPARE');
        const questions = {
            get: vi.fn().mockImplementation((s: Section) => s.questionRefs.map((q) => questionFactory.build({ uuid: q }))),
            values: vi.fn().mockImplementation(() => test.sections.map((s) => s.questionRefs.map((q) => questionFactory.build({ uuid: q })))),
            entries: vi.fn().mockImplementation(() => test.sections.map((s) => [s, s.questionRefs.map((q) => questionFactory.build({ uuid: q }))])),
        } as unknown as Map<Section, Question[]>;

        // prettier-ignore
        const expectedDeliveryItemUuids = test.sections.flatMap(s => s.questionRefs);

        // prettier-ignore
        const actualDeliveryItemUuids = TestDeliveryStoreInitializer['buildInRandomOrder'](test, attempt, questions, 10, new Map([[test.sections[0], 1.0]]))
            .map((d) => deliveryItemToUuidMapper(d));

        expect(actualDeliveryItemUuids).toEqual(expect.arrayContaining(expectedDeliveryItemUuids));
    });

    test('buildInRandomOrder default section fraction of questions', () => {
        const test = testFactory.build({}, { defaultSection: true, questionsPerSection: 10 });
        const attempt = TestDeliveryStoreInitializer['buildAttempt'](test, 'PREPARE');
        const questions = {
            get: vi.fn().mockImplementation((s: Section) => s.questionRefs.map((q) => questionFactory.build({ uuid: q }))),
            values: vi.fn().mockImplementation(() => test.sections.map((s) => s.questionRefs.map((q) => questionFactory.build({ uuid: q })))),
            entries: vi.fn().mockImplementation(() => test.sections.map((s) => [s, s.questionRefs.map((q) => questionFactory.build({ uuid: q }))])),
        } as unknown as Map<Section, Question[]>;

        // prettier-ignore
        const actualDeliveryItemUuids = TestDeliveryStoreInitializer['buildInRandomOrder'](test, attempt, questions, 7, new Map([[test.sections[0], 1.0]]))
            .map((d) => deliveryItemToUuidMapper(d));

        expect(actualDeliveryItemUuids).toHaveLength(7);
    });

    test('buildInRandomOrder 3 sections fraction of questions', () => {
        const test = testFactory.build({}, { defaultSection: false, sectionCount: 3, questionsPerSection: 10 });
        const attempt = TestDeliveryStoreInitializer['buildAttempt'](test, 'PREPARE');
        const questions = {
            get: vi.fn().mockImplementation((s: Section) => s.questionRefs.map((q) => questionFactory.build({ uuid: q }))),
            values: vi.fn().mockImplementation(() => test.sections.map((s) => s.questionRefs.map((q) => questionFactory.build({ uuid: q })))),
            entries: vi.fn().mockImplementation(() => test.sections.map((s) => [s, s.questionRefs.map((q) => questionFactory.build({ uuid: q }))])),
        } as unknown as Map<Section, Question[]>;

        // prettier-ignore
        const actualDeliveryItemUuids = TestDeliveryStoreInitializer['buildInRandomOrder'](test, attempt, questions, 13, new Map([[test.sections[0], 0.7], [test.sections[1], 0.2], [test.sections[2], 0.1]]))
            .map((d) => deliveryItemToUuidMapper(d));

        expect(actualDeliveryItemUuids).toHaveLength(13);
    });

    test('buildInRandomOrder 3 sections fraction of questions requiring randomized backfilling', () => {
        const test = testFactory.build({}, { defaultSection: false, sectionCount: 3, questionsPerSection: 10 });
        const attempt = TestDeliveryStoreInitializer['buildAttempt'](test, 'PREPARE');
        const questions = {
            get: vi.fn().mockImplementation((s: Section) => s.questionRefs.map((q) => questionFactory.build({ uuid: q }))),
            values: vi.fn().mockImplementation(() => test.sections.map((s) => s.questionRefs.map((q) => questionFactory.build({ uuid: q })))),
            entries: vi.fn().mockImplementation(() => test.sections.map((s) => [s, s.questionRefs.map((q) => questionFactory.build({ uuid: q }))])),
        } as unknown as Map<Section, Question[]>;

        // prettier-ignore
        const actualDeliveryItemUuids = TestDeliveryStoreInitializer['buildInRandomOrder'](test, attempt, questions, 18, new Map([[test.sections[0], 0.7], [test.sections[1], 0.2], [test.sections[2], 0.1]]))
            .map((d) => deliveryItemToUuidMapper(d));

        expect(actualDeliveryItemUuids).toHaveLength(18);
    });

    test('buildInRandomPerSectionOrder default section all', () => {
        const test = testFactory.build({}, { questionsPerSection: 10 });
        const attempt = TestDeliveryStoreInitializer['buildAttempt'](test, 'PREPARE');
        const questions = {
            get: vi.fn().mockImplementation((s: Section) => s.questionRefs.map((q) => questionFactory.build({ uuid: q }))),
            values: vi.fn().mockImplementation(() => test.sections.map((s) => s.questionRefs.map((q) => questionFactory.build({ uuid: q })))),
            entries: vi.fn().mockImplementation(() => test.sections.map((s) => [s, s.questionRefs.map((q) => questionFactory.build({ uuid: q }))])),
        } as unknown as Map<Section, Question[]>;

        // prettier-ignore
        const expectedDeliveryItemUuids = test.sections.flatMap(s => [
            s.uuid,
            ...s.questionRefs
        ]);

        // prettier-ignore
        const actualDeliveryItemUuids = TestDeliveryStoreInitializer['buildInRandomPerSectionOrder'](test, attempt, questions, 10, new Map([[test.sections[0], 1.0]]))
            .map((d) => deliveryItemToUuidMapper(d));

        expect(actualDeliveryItemUuids).toEqual(expect.arrayContaining(expectedDeliveryItemUuids));
    });

    test('buildInRandomPerSectionOrder default section fraction of questions', () => {
        const test = testFactory.build({}, { defaultSection: true, questionsPerSection: 10 });
        const attempt = TestDeliveryStoreInitializer['buildAttempt'](test, 'PREPARE');
        const questions = {
            get: vi.fn().mockImplementation((s: Section) => s.questionRefs.map((q) => questionFactory.build({ uuid: q }))),
            values: vi.fn().mockImplementation(() => test.sections.map((s) => s.questionRefs.map((q) => questionFactory.build({ uuid: q })))),
            entries: vi.fn().mockImplementation(() => test.sections.map((s) => [s, s.questionRefs.map((q) => questionFactory.build({ uuid: q }))])),
        } as unknown as Map<Section, Question[]>;

        // prettier-ignore
        const actualDeliveryItemUuids = TestDeliveryStoreInitializer['buildInRandomPerSectionOrder'](test, attempt, questions, 7, new Map([[test.sections[0], 0.7]]))
            .map((d) => deliveryItemToUuidMapper(d));

        expect(actualDeliveryItemUuids).toHaveLength(8); // the first of these is the section uuid
        expect(actualDeliveryItemUuids[0]).toEqual(test.sections[0].uuid);
    });

    test('buildInRandomPerSectionOrder 3 sections fraction of questions', () => {
        const test = testFactory.build({}, { defaultSection: false, sectionCount: 3, questionsPerSection: 10 });
        const attempt = TestDeliveryStoreInitializer['buildAttempt'](test, 'PREPARE');
        const questions = {
            get: vi.fn().mockImplementation((s: Section) => s.questionRefs.map((q) => questionFactory.build({ uuid: q }))),
            values: vi.fn().mockImplementation(() => test.sections.map((s) => s.questionRefs.map((q) => questionFactory.build({ uuid: q })))),
            entries: vi.fn().mockImplementation(() => test.sections.map((s) => [s, s.questionRefs.map((q) => questionFactory.build({ uuid: q }))])),
        } as unknown as Map<Section, Question[]>;

        // prettier-ignore
        const actualDeliveryItemUuids = TestDeliveryStoreInitializer['buildInRandomPerSectionOrder'](test, attempt, questions, 13, new Map([[test.sections[0], 0.7], [test.sections[1], 0.3], [test.sections[2], 0.2]]))
            .map((d) => deliveryItemToUuidMapper(d));

        expect(actualDeliveryItemUuids).toHaveLength(16); // 3 of these are section uuids
        expect(actualDeliveryItemUuids[0]).toEqual(test.sections[0].uuid);
        expect(actualDeliveryItemUuids[10]).toEqual(test.sections[1].uuid);
        expect(actualDeliveryItemUuids[14]).toEqual(test.sections[2].uuid);
    });
});
