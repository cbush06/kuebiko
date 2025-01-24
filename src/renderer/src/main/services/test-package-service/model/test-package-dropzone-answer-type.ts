import { TestPackageAnswerType } from '@renderer/services/test-package-service/model/test-package-answer';
import { TestPackagePoint } from '@renderer/services/test-package-service/model/test-package-point';
import { TestPackageRectangle } from '@renderer/services/test-package-service/model/test-package-rectangle';

export interface TestPackageDropzoneAnswerType {
    answer: Exclude<TestPackageAnswerType, TestPackagePoint[][] | TestPackageDropzoneAnswerType>;
    dropZone: TestPackageRectangle;
}