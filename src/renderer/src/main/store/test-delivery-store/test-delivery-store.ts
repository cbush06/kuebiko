import { Attempt } from '@renderer/db/models/attempt';
import { QuestionResponse } from '@renderer/db/models/question-response';
import { Section } from '@renderer/db/models/section';
import { Test } from '@renderer/db/models/test';
import { AbstractDeliveryItem } from '@renderer/store/test-delivery-store/delivery-item/abstract-delivery-item';
import { SectionDeliveryItem } from '@renderer/store/test-delivery-store/delivery-item/section-delivery-item';
import { DeliveryItemIsNotRevisitableError } from '@renderer/store/test-delivery-store/errors/delivery-item-is-not-revisitable-error';
import { NoMoreDeliveryItemsError } from '@renderer/store/test-delivery-store/errors/no-more-delivery-items-error';
import { NoPreviousDeliveryItemsError } from '@renderer/store/test-delivery-store/errors/no-prev-delivery-items-error';
import { defineStore } from 'pinia';
import { QuestionDeliveryItem } from './delivery-item/question-delivery-item';
import { getQuestionEvaluator } from './question-evaluators/question-evaluator-factory';
import { DeliveryFormat } from './types/delivery-format';

export interface TestDeliveryStoreState {
    // Props
    initialized: boolean;
    test?: Test;
    attempt?: Attempt;
    deliveryItems: AbstractDeliveryItem[];
    description?: string;
    deliveryItem?: AbstractDeliveryItem;
    deliveryItemIndex: number;
    duration?: number;
    section?: Section;
    format?: DeliveryFormat;
    inProgress: boolean;
    completed: boolean;

    // Getters
    isNextItemNewSection: boolean;
    canGoBackward: boolean;
    canGoForward: boolean;
    currentQuestionNumber: number;
    totalQuestions: number;
}

export const useTestDeliveryStore = defineStore('test-delivery', {
    state: () =>
        ({
            initialized: false,
            test: undefined,
            attempt: undefined,
            deliveryItems: [],
            description: undefined,
            deliveryItem: undefined,
            deliveryItemIndex: -1,
            duration: undefined,
            section: undefined,
            format: undefined,
            inProgress: false,
            completed: false,
        }) as unknown as TestDeliveryStoreState,
    getters: {
        isNextItemNewSection(state) {
            const isNextItemSection =
                state.deliveryItems[state.deliveryItemIndex + 1] instanceof SectionDeliveryItem;
            return this.canGoForward && isNextItemSection;
        },
        canGoForward: (state) =>
            !!state.test && state.deliveryItemIndex < state.deliveryItems.length - 1,
        canGoBackward: (state) => {
            // if (!state.test) return false;
            const hasPreviousItem = state.deliveryItemIndex > 0;
            const canRevisitPreviousItem =
                state.deliveryItems[state.deliveryItemIndex - 1]?.isRevisitable();
            const isThisItemSection = state.deliveryItem instanceof SectionDeliveryItem;
            return hasPreviousItem && canRevisitPreviousItem && !isThisItemSection;
        },
        // prettier-ignore
        currentQuestionNumber: (state) => state.deliveryItem 
            ? state.deliveryItems
                .filter(di => di instanceof QuestionDeliveryItem)
                .indexOf(state.deliveryItem!) + 1
            : -1,
        // prettier-ignore
        totalQuestions: (state) => state.deliveryItems
            .filter((di) => di instanceof QuestionDeliveryItem)
            .length,
    },
    actions: {
        forward() {
            if (this.deliveryItemIndex === this.deliveryItems.length - 1) {
                throw new NoMoreDeliveryItemsError();
            }

            // deliveryItemIndex is -1 at the start, so we know the user has begun the text and we record the timestamp.
            if (this.deliveryItemIndex < 0) {
                this.attempt!.started = new Date();
            }

            this.inProgress = true;
            this.deliveryItem = this.deliveryItems[++this.deliveryItemIndex];

            // Did the section change?
            if (this.deliveryItem instanceof SectionDeliveryItem) {
                this.section = this.deliveryItem.getModel();
            }
        },
        backward() {
            if (this.deliveryItemIndex < 1) {
                throw new NoPreviousDeliveryItemsError();
            }

            const previousDeliveryItem = this.deliveryItems[this.deliveryItemIndex - 1];

            if (!previousDeliveryItem.isRevisitable()) {
                throw new DeliveryItemIsNotRevisitableError();
            }

            this.deliveryItem = this.deliveryItems[--this.deliveryItemIndex];
        },
        complete() {
            if (this.attempt) {
                this.attempt.completed = new Date();

                let totalCredit = 0;
                this.deliveryItems.forEach((qdi) => {
                    if (qdi instanceof QuestionDeliveryItem) {
                        const resp = qdi.getModel() as QuestionResponse;
                        if (resp.response) {
                            resp.credit = getQuestionEvaluator(qdi.getQuestionType()).evaluate(
                                qdi.getCorrectResponse()!,
                                resp.response,
                            );
                        } else {
                            resp.credit = 0;
                        }
                        totalCredit += resp.credit;
                    }
                });

                this.attempt.score = totalCredit / this.totalQuestions;
                this.attempt.status = 'COMPLETED';
                this.inProgress = false;
                this.completed = true;
            }
        },
        reset() {
            this.$state = {
                initialized: false,
                test: undefined,
                attempt: undefined,
                deliveryItems: [],
                description: undefined,
                deliveryItem: undefined,
                deliveryItemIndex: -1,
                duration: undefined,
                section: undefined,
                format: undefined,
                inProgress: false,
                completed: false,
            } as unknown as TestDeliveryStoreState;
        },
    },
});
