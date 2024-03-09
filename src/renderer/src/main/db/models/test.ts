import { Author } from './author';
import { Section } from './section';

export interface Test {
    uuid: string;
    title: string;
    version: number;
    descriptionRef?: string;
    authors: Author[];
    created: Date;
    resourceRefs: string[];
    sections: Section[];
    tags: string[];
    passingPercentage?: number;
    allowedTime?: number;
}
