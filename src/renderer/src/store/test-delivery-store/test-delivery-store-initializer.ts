import { KuebikoDb } from '@renderer/db/kuebiko-db';
import { Attempt } from '@renderer/db/models/attempt';
import { Question } from '@renderer/db/models/question';
import { QuestionResponse } from '@renderer/db/models/question-response';
import { Test } from '@renderer/db/models/test';
import { useTestDeliveryStore } from '@renderer/store/test-delivery-store/test-delivery-store';
import { ArrayUtils } from '@renderer/utils/array-utils';
import { AbstractDeliveryItem } from './delivery-item/abstract-delivery-item';
import { QuestionDeliveryItem } from './delivery-item/question-delivery-item';
import { SectionDeliveryItem } from './delivery-item/section-delivery-item';
import { NotEnoughQuestionsErrors } from './errors/not-enough-questions-error';
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
        const totalQuestions = test.sections.reduce((runningTotal, nextSection) => runningTotal + nextSection.questionRefs.length, 0);
        const fractionPerSection = test.sections.map((s) => s.questionRefs.length / totalQuestions);
        const allQuestionRefs = test.sections.flatMap((s) => s.questionRefs);
        const questions = new Map((await KuebikoDb.INSTANCE.questions.where('uuid').anyOf(allQuestionRefs).toArray()).map((q) => [q.uuid, q]));

        switch (options.order) {
            case 'ORIGINAL':
                return TestDeliveryStoreInitializer.buildInOriginalOrder(test, attempt, questions);
            case 'RANDOM':
                return TestDeliveryStoreInitializer.buildInRandomOrder(test, attempt, questions, totalQuestions, fractionPerSection);
            case 'RANDOM_BY_SECTION':
                return TestDeliveryStoreInitializer.buildInRandomPerSectionOrder(test, attempt, questions, totalQuestions, fractionPerSection);
        }
    }

    protected static buildInOriginalOrder(test: Test, attempt: Attempt, questions: Map<string, Question>): AbstractDeliveryItem[] {
        const deliveryItems = new Array<AbstractDeliveryItem>();
        for (const s of test.sections) {
            deliveryItems.push(new SectionDeliveryItem(test, s));
            for (const q of s.questionRefs) {
                const response = {
                    questionRef: q,
                    sectionRef: s.uuid,
                    credit: 0,
                };
                attempt.questionResponses.push(response);
                deliveryItems.push(new QuestionDeliveryItem(test, questions.get(q)!, response));
            }
        }
        return deliveryItems;
    }

    protected static buildInRandomOrder(
        test: Test,
        attempt: Attempt,
        questions: Map<string, Question>,
        totalQuestions: number,
        fractionPerSection: number[],
    ): AbstractDeliveryItem[] {
        const questionPoolSize = test.sections.reduce((count, nextSection) => count + nextSection.questionRefs.length, 0);

        // Ensure the question pool is large enough
        if (totalQuestions > questionPoolSize) {
            throw new NotEnoughQuestionsErrors();
        }

        const selectedQuestionRefs = new Array<string>();

        const deliveryItems = new Array<AbstractDeliveryItem>();
        for (let si = 0; si < test.sections.length; si++) {
            const section = test.sections[si];
            const questionsPerThisSection = Math.min(section.questionRefs.length, Math.round(totalQuestions * fractionPerSection[si]));
            const questionsSlice = Array.from(section.questionRefs);

            for (let remainingQuestionsToTake = questionsPerThisSection; remainingQuestionsToTake > 0; remainingQuestionsToTake--) {
                const randomQuestion = ArrayUtils.randomEntryWithRemoval(questionsSlice);
                selectedQuestionRefs.push(randomQuestion);
                attempt.questionResponses.push({
                    questionRef: randomQuestion,
                    sectionRef: section.uuid,
                    credit: 0,
                });
            }
        }

        // Randomly pad out the list of questions until it reaches the desired length
        if (attempt.questionResponses.length < totalQuestions) {
            const allQuestionRefs = test.sections.flatMap((s) => s.questionRefs.map((q) => [s.uuid, q]));

            while (attempt.questionResponses.length < totalQuestions) {
                const randomQuestion = allQuestionRefs[Math.floor(Math.random() * allQuestionRefs.length)];

                if (selectedQuestionRefs.includes(randomQuestion[1])) continue;

                selectedQuestionRefs.push(randomQuestion[1]);
                attempt.questionResponses.push({
                    questionRef: randomQuestion[1],
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
        questions: Map<string, Question>,
        totalQuestions: number,
        fractionPerSection: number[],
    ): AbstractDeliveryItem[] {
        const questionPoolSize = test.sections.reduce((count, nextSection) => count + nextSection.questionRefs.length, 0);

        // Ensure the question pool is large enough
        if (totalQuestions > questionPoolSize) {
            throw new NotEnoughQuestionsErrors();
        }

        const selectedQuestionRefs = new Array<string>();
        const selectedQuestionRefsBySection = new Map<string, QuestionDeliveryItem[]>();

        for (let si = 0; si < test.sections.length; si++) {
            const section = test.sections[si];
            const questionsPerThisSection = Math.min(section.questionRefs.length, Math.round(totalQuestions * fractionPerSection[si]));
            const questionsSlice = Array.from(section.questionRefs);

            if (!selectedQuestionRefsBySection.has(section.uuid)) selectedQuestionRefsBySection.set(section.uuid, []);

            for (let remainingQuestionsToTake = questionsPerThisSection; remainingQuestionsToTake > 0; remainingQuestionsToTake--) {
                const randomQuestion = ArrayUtils.randomEntryWithRemoval(questionsSlice);

                selectedQuestionRefs.push(randomQuestion);

                // IMPORTANT: this object should be shared BY REFERENCE between the question responses array and QuestionDeliveryItems
                const questionResponse = {
                    questionRef: randomQuestion,
                    sectionRef: section.uuid,
                    credit: 0,
                };

                selectedQuestionRefsBySection.get(section.uuid)?.push(new QuestionDeliveryItem(test, questions.get(randomQuestion)!, questionResponse));
                attempt.questionResponses.push(questionResponse);
            }
        }

        // Randomly pad out the list of questions until it reaches the desired length
        if (attempt.questionResponses.length < totalQuestions) {
            const allQuestionRefs = test.sections.flatMap((s) => s.questionRefs.map((q) => [s.uuid, q]));

            while (attempt.questionResponses.length < totalQuestions) {
                const randomQuestion = allQuestionRefs[Math.floor(Math.random() * allQuestionRefs.length)];

                if (selectedQuestionRefs.includes(randomQuestion[1])) continue;

                selectedQuestionRefs.push(randomQuestion[1]);

                // IMPORTANT: this object should be shared BY REFERENCE between the question responses array and QuestionDeliveryItems
                const questionResponse = {
                    questionRef: randomQuestion[1],
                    sectionRef: randomQuestion[0],
                    credit: 0,
                };

                selectedQuestionRefsBySection.get(randomQuestion[0])?.push(new QuestionDeliveryItem(test, questions.get(randomQuestion[1])!, questionResponse));
                attempt.questionResponses.push(questionResponse);
            }
        }

        return test.sections.flatMap((s) => [new SectionDeliveryItem(test, s), ...selectedQuestionRefsBySection.get(s.uuid)!]);
    }
}
