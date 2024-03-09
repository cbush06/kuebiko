import { TestPackageAuthor } from './test-package-author';
import { TestPackageResource } from './test-package-resource';
import { TestPackageSection } from './test-package-section';

export interface Manifest {
    uuid: string;
    title: string;
    version: number;
    descriptionRef?: string;
    authors: TestPackageAuthor[];
    created: string;
    resources: TestPackageResource[];
    sections: TestPackageSection[];
    tags: string[];
    passingPercentage?: number;
    allowedTime?: number;
}
