import { KuebikoDb } from '@renderer/db/kuebiko-db';
import { Attempt } from '@renderer/db/models/attempt';
import { Question } from '@renderer/db/models/question';
import { QuestionResponse } from '@renderer/db/models/question-response';
import { Section } from '@renderer/db/models/section';
import { Test } from '@renderer/db/models/test';
import { useTestDeliveryStore } from '@renderer/store/test-delivery-store/test-delivery-store';
import { ArrayUtils } from '@renderer/utils/array-utils';
import { AbstractDeliveryItem } from './delivery-item/abstract-delivery-item';
import { QuestionDeliveryItem } from './delivery-item/question-delivery-item';
import { SectionDeliveryItem } from './delivery-item/section-delivery-item';
import { NotEnoughQuestionsErrors as NotEnoughQuestionsError } from './errors/not-enough-questions-error';
import { AbstractQuestionFilter } from './question-filter/abstract-question-filter';
import { MatchAllQuestionFilter } from './question-filter/match-all-question-filter';
import { DeliveryFormat } from './types/delivery-format';

export type QuestionOrder = 'ORIGINAL' | 'RANDOM' | 'RANDOM_BY_SECTION';

export interface TestEngineOptions {
    filter: AbstractQuestionFilter;
    order: QuestionOrder;
    maxQuestions?: number;
    format?: DeliveryFormat;
    duration?: number;
}

export const DEFAULT_OPTIONS = (test: Test) =>
    ({
        filter: new MatchAllQuestionFilter(test),
        order: 'ORIGINAL',
        format: 'PREPARE',
        duration: 0,
    }) as Readonly<TestEngineOptions>;

export class TestDeliveryStoreInitializer {
    private constructor() {}

    static async initializeTestDeliveryStore(test: Test, options: TestEngineOptions = DEFAULT_OPTIONS(test)) {
        const testStore = useTestDeliveryStore();
        testStore.initialized = true;
        testStore.test = test;
        testStore.attempt = TestDeliveryStoreInitializer.buildAttempt(test, options.format ?? 'SIMULATE');
        testStore.deliveryItems = await TestDeliveryStoreInitializer.buildDeliveryItemList(test, testStore.attempt, options);
        testStore.description = undefined;
        testStore.deliveryItem = undefined;
        testStore.deliveryItemIndex = -1;
        testStore.duration = options.duration;
        testStore.section = undefined;
        testStore.format = options.format;
        testStore.inProgress = false;
        testStore.completed = false;
        if (test?.descriptionRef) {
            testStore.description = (await KuebikoDb.INSTANCE.resources.where('uuid').equals(test.descriptionRef).first())?.data as string;
        }
    }

    protected static buildAttempt(test: Test, format: DeliveryFormat): Attempt {
        return {
            uuid: globalThis.crypto.randomUUID(),
            testRef: test.uuid,
            status: 'INPROGRESS',
            score: 0,
            questionResponses: new Array<QuestionResponse>(),
            format,
        } as Attempt;
    }

    protected static async buildDeliveryItemList(test: Test, attempt: Attempt, options: TestEngineOptions): Promise<AbstractDeliveryItem[]> {
        const eligibleQuestionsBySection = new Map<Section, Question[]>();

        for (const section of test.sections) {
            const eligibleSectionQuestions = (await KuebikoDb.INSTANCE.questions.bulkGet(section.questionRefs)).filter((q) => options.filter.match(q!));

            if (eligibleSectionQuestions.length) {
                eligibleQuestionsBySection.set(section, eligibleSectionQuestions as Question[]);
            }
        }

        const availableQuestions = Array.from(eligibleQuestionsBySection.values()).reduce((runningTotal, next) => runningTotal + next.length, 0);
        const totalQuestionsRequired = options.maxQuestions ?? availableQuestions;
        const fractionPerSection = new Map<Section, number>(
            Array.from(eligibleQuestionsBySection.entries()).map(([section, sectionQuestions]) => [section, sectionQuestions.length / totalQuestionsRequired]),
        );

        switch (options.order) {
            case 'ORIGINAL':
                return TestDeliveryStoreInitializer.buildInOriginalOrder(test, attempt, eligibleQuestionsBySection);
            case 'RANDOM':
                return TestDeliveryStoreInitializer.buildInRandomOrder(test, attempt, eligibleQuestionsBySection, totalQuestionsRequired, fractionPerSection);
            case 'RANDOM_BY_SECTION':
                return TestDeliveryStoreInitializer.buildInRandomPerSectionOrder(
                    test,
                    attempt,
                    eligibleQuestionsBySection,
                    totalQuestionsRequired,
                    fractionPerSection,
                );
        }
    }

    protected static buildInOriginalOrder(test: Test, attempt: Attempt, questionsBySection: Map<Section, Question[]>): AbstractDeliveryItem[] {
        const deliveryItems = new Array<AbstractDeliveryItem>();

        for (const s of test.sections) {
            deliveryItems.push(new SectionDeliveryItem(test, s));
            for (const q of questionsBySection.get(s)!) {
                const response = {
                    questionRef: q.uuid,
                    sectionRef: s.uuid,
                    credit: 0,
                };
                attempt.questionResponses.push(response);
                deliveryItems.push(new QuestionDeliveryItem(test, q, response));
            }
        }
        return deliveryItems;
    }

    protected static buildInRandomOrder(
        test: Test,
        attempt: Attempt,
        questionsBySection: Map<Section, Question[]>,
        totalQuestionsRequired: number,
        fractionPerSection: Map<Section, number>,
    ): AbstractDeliveryItem[] {
        const questions = Array.from(questionsBySection.values())
            .flatMap((q) => q)
            .reduce((m, q) => {
                m.set(q.uuid, q);
                return m;
            }, new Map<string, Question>());

        const questionsAvailable = questions.size;
        if (questionsAvailable < totalQuestionsRequired) {
            throw new NotEnoughQuestionsError();
        }

        const selectedQuestionRefs = new Array<string>();

        const deliveryItems = new Array<AbstractDeliveryItem>();
        for (const [section, sectionQuestions] of questionsBySection.entries()) {
            const questionsPerThisSection = Math.min(sectionQuestions.length, Math.floor(totalQuestionsRequired * fractionPerSection.get(section)!));
            const questionsSlice = Array.from(sectionQuestions);

            for (let remainingQuestionsToTake = questionsPerThisSection; remainingQuestionsToTake > 0; remainingQuestionsToTake--) {
                if (selectedQuestionRefs.length === totalQuestionsRequired) continue;

                const randomQuestion = ArrayUtils.randomEntryWithRemoval(questionsSlice);
                selectedQuestionRefs.push(randomQuestion.uuid);
                attempt.questionResponses.push({
                    questionRef: randomQuestion.uuid,
                    sectionRef: section.uuid,
                    credit: 0,
                });
            }
        }

        // Randomly pad out the list of questions until it reaches the desired length
        if (attempt.questionResponses.length < totalQuestionsRequired) {
            const allQuestions: Array<[string, Question]> = Array.from(questionsBySection.entries()).flatMap(([s, q]) =>
                q.map((q) => [s.uuid, q] as [string, Question]),
            );

            while (attempt.questionResponses.length < totalQuestionsRequired) {
                const randomQuestion = allQuestions[Math.floor(Math.random() * allQuestions.length)];

                if (selectedQuestionRefs.includes(randomQuestion[1].uuid)) continue;

                selectedQuestionRefs.push(randomQuestion[1].uuid);
                attempt.questionResponses.push({
                    questionRef: randomQuestion[1].uuid,
                    sectionRef: randomQuestion[0],
                    credit: 0,
                });
            }
        }

        ArrayUtils.shuffleArray(attempt.questionResponses);

        // prettier-ignore
        attempt.questionResponses
            .map(r => new QuestionDeliveryItem(test, questions.get(r.questionRef)!, r))
            .forEach(di => deliveryItems.push(di));

        return deliveryItems;
    }

    protected static buildInRandomPerSectionOrder(
        test: Test,
        attempt: Attempt,
        questionsBySection: Map<Section, Question[]>,
        totalQuestionsRequired: number,
        fractionPerSection: Map<Section, number>,
    ): AbstractDeliveryItem[] {
        const selectedQuestionRefs = new Array<string>();
        const selectedQuestionRefsBySection = new Map<string, QuestionDeliveryItem[]>();
        const questionsAvailable = Array.from(questionsBySection.values()).reduce((cnt, q) => cnt + q.length, 0);

        if (questionsAvailable < totalQuestionsRequired) {
            throw new NotEnoughQuestionsError();
        }

        for (const [section, sectionQuestions] of questionsBySection.entries()) {
            const questionsPerThisSection = Math.min(sectionQuestions.length, Math.floor(totalQuestionsRequired * fractionPerSection.get(section)!));
            const questionsSlice = Array.from(sectionQuestions);

            if (!selectedQuestionRefsBySection.has(section.uuid)) selectedQuestionRefsBySection.set(section.uuid, []);

            for (let remainingQuestionsToTake = questionsPerThisSection; remainingQuestionsToTake > 0; remainingQuestionsToTake--) {
                if (selectedQuestionRefs.length === totalQuestionsRequired) continue;

                const randomQuestion = ArrayUtils.randomEntryWithRemoval(questionsSlice);

                selectedQuestionRefs.push(randomQuestion.uuid);

                // IMPORTANT: this object should be shared BY REFERENCE between the question responses array and QuestionDeliveryItems
                const questionResponse = {
                    questionRef: randomQuestion.uuid,
                    sectionRef: section.uuid,
                    credit: 0,
                };

                selectedQuestionRefsBySection.get(section.uuid)?.push(new QuestionDeliveryItem(test, randomQuestion, questionResponse));
                attempt.questionResponses.push(questionResponse);
            }
        }

        // Randomly pad out the list of questions until it reaches the desired length
        if (attempt.questionResponses.length < totalQuestionsRequired) {
            const allQuestions: Array<[string, Question]> = Array.from(questionsBySection.entries()).flatMap(([s, q]) =>
                q.map((q) => [s.uuid, q] as [string, Question]),
            );

            while (attempt.questionResponses.length < totalQuestionsRequired) {
                const randomQuestion = allQuestions[Math.floor(Math.random() * allQuestions.length)];

                if (selectedQuestionRefs.includes(randomQuestion[1].uuid)) continue;

                selectedQuestionRefs.push(randomQuestion[1].uuid);

                // IMPORTANT: this object should be shared BY REFERENCE between the question responses array and QuestionDeliveryItems
                const questionResponse = {
                    questionRef: randomQuestion[1].uuid,
                    sectionRef: randomQuestion[0],
                    credit: 0,
                };

                selectedQuestionRefsBySection.get(randomQuestion[0])?.push(new QuestionDeliveryItem(test, randomQuestion[1], questionResponse));
                attempt.questionResponses.push(questionResponse);
            }
        }

        return test.sections.flatMap((s) => [new SectionDeliveryItem(test, s), ...selectedQuestionRefsBySection.get(s.uuid)!]);
    }
}
