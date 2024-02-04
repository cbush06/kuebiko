import { QuestionResponse } from '@renderer/db/models/question-response';
import { Section } from '@renderer/db/models/section';

export abstract class AbstractDeliveryItem {
    protected visited = false;

    abstract isRevisitable(): boolean;

    abstract isIncludedInCount(): boolean;

    abstract getModel(): Section | QuestionResponse;

    abstract getContentRef(): string;

    abstract getPath(): string;

    isVisited() {
        return this.visited;
    }

    visit() {
        this.visited = true;
    }
}
