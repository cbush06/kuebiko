import { KuebikoDb } from '@renderer/db/kuebiko-db';
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

export class TestPackageMarshaller {
    static async unmarshal(file: File, db: KuebikoDb): Promise<Test> {
        // Read the manifest
        const zip = await JSZip.loadAsync(file);
        const manifestFile = await zip.files['manifest.json'].async('string');

        if (!manifestFile) {
            throw new MissingTestPackageFileError('manifest.json');
        }

        const manifest = JSON.parse(manifestFile) as Manifest;

        const authorMarshaller = new AuthorMarshaller(zip, manifest, db);
        const resourceMarshaller = new ResourceMarshaller(zip, manifest, db);
        const optionMarshaller = new OptionMarshaller(zip, manifest, db);
        const questionMarshaller = new QuestionMarshaller(zip, manifest, db, optionMarshaller);
        const sectionMarshaller = new SectionMarshaller(zip, manifest, db, questionMarshaller);

        return await new TestMarshaller(zip, manifest, db, authorMarshaller, resourceMarshaller, sectionMarshaller).unmarshall(manifest);
    }
}
