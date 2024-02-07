import { Option } from '@renderer/db/models/option';
import { AbstractMarshaller } from './abstract-marshaller';
import { TestPackageOption } from '../model/test-package-option';

export class OptionMarshaller extends AbstractMarshaller<Option, TestPackageOption> {
    marshal(o: Option): Promise<TestPackageOption> {
        throw new Error('Method not implemented.');
    }

    unmarshall(o: TestPackageOption): Promise<Option> {
        return Promise.resolve({
            uuid: o.uuid,
            contentText: o.contentText,
            contentRef: o.contentRef,
            explanation: o.explanation,
        } as Option);
    }
}