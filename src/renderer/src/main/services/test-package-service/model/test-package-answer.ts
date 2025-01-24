import { TestPackagePoint } from './test-package-point';
import { TestPackageDropzoneAnswerType } from '@renderer/services/test-package-service/model/test-package-dropzone-answer-type';

export type TestPackageAnswerType =
    | string
    | string[]
    | TestPackagePoint[][]
    | TestPackageDropzoneAnswerType[];
