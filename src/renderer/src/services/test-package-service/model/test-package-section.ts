import { TestPackageQuestion } from './test-package-question';

export interface TestPackageSection {
    uuid: string;
    default: boolean;
    title: string;
    descriptionText?: string;
    descriptionRef?: string;
    questions: TestPackageQuestion[];
}
