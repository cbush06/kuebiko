export class MissingTestPackageFileError extends Error {
    constructor(fileName: string) {
        super(`Expected to find file ${fileName} in test package, but it was missing.`);
    }
}
