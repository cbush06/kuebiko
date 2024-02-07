import { Attempt } from '@renderer/db/models/attempt';
import { Section } from '@renderer/db/models/section';
import { Test } from '@renderer/db/models/test';
import { AbstractDeliveryItem } from '@renderer/store/test-delivery-store/delivery-item/abstract-delivery-item';
import { SectionDeliveryItem } from '@renderer/store/test-delivery-store/delivery-item/section-delivery-item';
import { DeliveryItemIsNotRevisitableError } from '@renderer/store/test-delivery-store/errors/delivery-item-is-not-revisitable-error';
import { NoMoreDeliveryItemsError } from '@renderer/store/test-delivery-store/errors/no-more-delivery-items-error';
import { NoPreviousDeliveryItemsError } from '@renderer/store/test-delivery-store/errors/no-prev-delivery-items-error';
import { defineStore } from 'pinia';
import { QuestionDeliveryItem } from './delivery-item/question-delivery-item';
import { DeliveryFormat } from './types/delivery-format';

export interface TestDeliveryStoreState {
    test?: Test;
    attempt?: Attempt;
    deliveryItems: AbstractDeliveryItem[];
    description?: string;
    deliveryItem?: AbstractDeliveryItem;
    deliveryItemIndex: number;
    section?: Section;
    format?: DeliveryFormat;
}

export const useTestDeliveryStore = defineStore('test-delivery', {
    state: () =>
        ({
            test: undefined,
            deliveryItems: [],
            description: undefined,
            deliveryItem: undefined,
            deliveryItemIndex: -1,
            section: undefined,
            format: undefined,
        }) as TestDeliveryStoreState,
    getters: {
        isNextItemNewSection: (state) => {
            const canGoForward = state.deliveryItemIndex < state.deliveryItems.length - 1;
            const isNextItemSection = state.deliveryItems[state.deliveryItemIndex + 1] instanceof SectionDeliveryItem;
            return canGoForward && isNextItemSection;
        },
        canGoForward: (state) => state.deliveryItemIndex < state.deliveryItems.length - 1,
        canGoBackward: (state) => {
            const hasPreviousItem = state.deliveryItemIndex > 0;
            const canRevisitPreviousItem = state.deliveryItems[state.deliveryItemIndex - 1]?.isRevisitable();
            return hasPreviousItem && canRevisitPreviousItem;
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
    },
});
