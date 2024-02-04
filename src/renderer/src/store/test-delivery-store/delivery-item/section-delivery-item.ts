import { Section } from '@renderer/db/models/section';
import { AbstractDeliveryItem } from './abstract-delivery-item';
import { Test } from '@renderer/db/models/test';

export class SectionDeliveryItem extends AbstractDeliveryItem {
    constructor(
        private test: Test,
        private section: Section,
    ) {
        super();
    }

    getModel(): Section {
        return this.section;
    }

    getContentRef(): string {
        return this.section.descriptionRef;
    }

    isRevisitable(): boolean {
        return false;
    }

    isIncludedInCount(): boolean {
        return false;
    }

    getPath(): string {
        return `/test/${this.test.uuid}/section`;
    }
}
