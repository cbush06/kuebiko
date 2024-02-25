export type TestPackageResourceType = 'IMAGE' | 'MARKDOWN' | 'AUDIO' | 'VIDEO';

export interface TestPackageResource {
    uuid: string;
    name: string;
    type: TestPackageResourceType;
    mime: string;
    sha256: string;
}
