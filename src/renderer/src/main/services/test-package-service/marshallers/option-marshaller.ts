import { Option } from '@renderer/db/models/option';
import { TestPackageOption } from '../model/test-package-option';
import { AbstractMarshaller } from './abstract-marshaller';

export class OptionMarshaller extends AbstractMarshaller<Option, TestPackageOption> {
    async marshall(o: Option): Promise<TestPackageOption> {
        return Promise.resolve({
            uuid: o.uuid,
            contentRef: o.contentRef,
            explanation: o.explanation,
            subjectImageArea: o.subjectImageArea,
        });
    }

    async unmarshall(o: TestPackageOption): Promise<Option> {
        return Promise.resolve({
            uuid: o.uuid,
            contentRef: o.contentRef,
            explanation: o.explanation,
            subjectImageArea: o.subjectImageArea,
        } as Option);
    }
}
