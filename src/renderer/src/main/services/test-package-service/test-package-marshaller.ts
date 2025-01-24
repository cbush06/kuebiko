import { Test } from '@renderer/db/models/test';
import JSZip from 'jszip';
import { MissingTestPackageFileError } from './errors/missing-test-package-file-error';
import { AuthorMarshaller } from './marshallers/author-marshaller';
import { OptionMarshaller } from './marshallers/option-marshaller';
import { QuestionMarshaller } from './marshallers/question-marshaller';
import { ResourceMarshaller } from './marshallers/resource-marshaller';
import { SectionMarshaller } from './marshallers/section-marshaller';
import { TestMarshaller } from './marshallers/test-marshaller';
import { Manifest } from './model/manifest';
import { KuebikoDbFacade } from '@renderer/services/kuebiko-db-facade';

export class TestPackageMarshaller {
    constructor(private db: KuebikoDbFacade) {}

    async marshall(test: Test): Promise<JSZip> {
        const jszip = new JSZip();

        const authorMarshaller = new AuthorMarshaller(jszip, this.db);
        const resourceMarshaller = new ResourceMarshaller(jszip, this.db);
        const optionMarshaller = new OptionMarshaller(jszip, this.db);
        const questionMarshaller = new QuestionMarshaller(jszip, this.db, optionMarshaller);
        const sectionMarshaller = new SectionMarshaller(jszip, this.db, questionMarshaller);

        // Write the test package
        const manifest = await new TestMarshaller(
            jszip,
            this.db,
            authorMarshaller,
            resourceMarshaller,
            sectionMarshaller,
        ).marshall(test);

        jszip.file('manifest.json', JSON.stringify(manifest));

        return jszip;
    }

    async unmarshall(file: File): Promise<Test> {
        // Read the manifest
        const zip = await JSZip.loadAsync(file);
        const manifestFile = await zip.files['manifest.json'].async('string');

        if (!manifestFile) {
            throw new MissingTestPackageFileError('manifest.json');
        }

        const manifest = JSON.parse(manifestFile) as Manifest;

        const authorMarshaller = new AuthorMarshaller(zip, this.db, manifest);
        const resourceMarshaller = new ResourceMarshaller(zip, this.db, manifest);
        const optionMarshaller = new OptionMarshaller(zip, this.db, manifest);
        const questionMarshaller = new QuestionMarshaller(zip, this.db, optionMarshaller, manifest);
        const sectionMarshaller = new SectionMarshaller(zip, this.db, questionMarshaller, manifest);

        return await new TestMarshaller(
            zip,
            this.db,
            authorMarshaller,
            resourceMarshaller,
            sectionMarshaller,
            manifest,
        ).unmarshall(manifest);
    }
}
