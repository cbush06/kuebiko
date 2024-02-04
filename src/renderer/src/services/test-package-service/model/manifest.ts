import { TestPackageResource } from './test-package-resource';
import { TestPackageSection } from './test-package-section';
import { TestPackageAuthor } from './test-package-author';

export interface Manifest {
    uuid: string;
    title: string;
    descriptionRef?: string;
    authors: TestPackageAuthor[];
    created: string;
    resources: TestPackageResource[];
    sections: TestPackageSection[];
    tags: string[];
}
