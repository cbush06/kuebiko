import { KuebikoDb } from '@renderer/db/kuebiko-db';
import { Option } from '@renderer/db/models/option';
import { OptionMarshaller } from '@renderer/services/test-package-service/marshallers/option-marshaller';
import { Manifest } from '@renderer/services/test-package-service/model/manifest';
import { TestPackageOption } from '@renderer/services/test-package-service/model/test-package-option';
import JSZip from 'jszip';
import { describe, expect, test } from 'vitest';

describe('option marshaller', async () => {
    let optionMarshaller = new OptionMarshaller({} as JSZip, {} as unknown as Manifest, {} as KuebikoDb);
    const toUnmarshal = {
        uuid: 'ad3sdf3adcklja3!53',
        contentText: 'Option A',
        contentRef: '3sdfdkl3fsdsf',
        explanation: 'You should have chosen this option because...',
    } as TestPackageOption;

    test('unmarshalls fields', async () => {
        expect(await optionMarshaller.unmarshall(toUnmarshal)).toStrictEqual({
            uuid: 'ad3sdf3adcklja3!53',
            contentText: 'Option A',
            contentRef: '3sdfdkl3fsdsf',
            explanation: 'You should have chosen this option because...',
        } as Option);
    });
});
