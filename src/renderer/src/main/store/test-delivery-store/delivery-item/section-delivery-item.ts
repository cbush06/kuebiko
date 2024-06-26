import { Section } from '@renderer/db/models/section';
import { Test } from '@renderer/db/models/test';
import { AbstractDeliveryItem } from './abstract-delivery-item';

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

    getContentRef(): string | undefined {
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

    setRevealed(): void {
        return;
    }

    isRevealed(): boolean {
        return true;
    }
}
