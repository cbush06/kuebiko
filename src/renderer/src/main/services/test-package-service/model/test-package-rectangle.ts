import { TestPackagePoint } from '@renderer/services/test-package-service/model/test-package-point';

export interface TestPackageRectangle extends TestPackagePoint {
    width: number;
    height: number;
}