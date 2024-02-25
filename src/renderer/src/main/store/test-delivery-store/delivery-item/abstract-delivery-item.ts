import { QuestionResponse } from '@renderer/db/models/question-response';
import { Section } from '@renderer/db/models/section';

export abstract class AbstractDeliveryItem {
    protected visited = false;

    abstract isRevisitable(): boolean;

    abstract isIncludedInCount(): boolean;

    abstract getModel(): Section | QuestionResponse;

    abstract getContentText(): string | undefined;

    abstract getContentRef(): string | undefined;

    abstract getPath(): string;

    abstract setRevealed(): void;

    abstract isRevealed(): boolean;

    isVisited() {
        return this.visited;
    }

    visit() {
        this.visited = true;
    }
}
