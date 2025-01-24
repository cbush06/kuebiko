import { Option } from '@renderer/db/models/option';
import { OptionMarshaller } from '@renderer/services/test-package-service/marshallers/option-marshaller';
import { Manifest } from '@renderer/services/test-package-service/model/manifest';
import { TestPackageOption } from '@renderer/services/test-package-service/model/test-package-option';
import JSZip from 'jszip';
import { describe, expect, test } from 'vitest';
import { KuebikoDbFacade } from '@renderer/services/kuebiko-db-facade';

describe('option marshaller', async () => {
    let optionMarshaller = new OptionMarshaller(
        {} as JSZip,
        {} as KuebikoDbFacade,
        {} as unknown as Manifest,
    );

    describe('unmarshalls', () => {
        const toUnmarshall = {
            uuid: 'ad3sdf3adcklja3!53',
            contentRef: '3sdfdkl3fsdsf',
            explanation: 'You should have chosen this option because...',
            subjectImageArea: [
                {
                    x: 90,
                    y: 90,
                },
            ],
        } as TestPackageOption;

        test('unmarshalls fields', async () => {
            expect(await optionMarshaller.unmarshall(toUnmarshall)).toStrictEqual({
                uuid: 'ad3sdf3adcklja3!53',
                contentRef: '3sdfdkl3fsdsf',
                explanation: 'You should have chosen this option because...',
                subjectImageArea: [
                    {
                        x: 90,
                        y: 90,
                    },
                ],
            } as Option);
        });
    });

    describe('marshalls', () => {
        const toMarshall = {
            uuid: 'ad3sdf3adcklja3!53',
            contentRef: '3sdfdkl3fsdsf',
            explanation: 'You should have chosen this option because...',
            subjectImageArea: [
                {
                    x: 90,
                    y: 90,
                },
            ],
        } as Option;

        test('unmarshalls fields', async () => {
            expect(await optionMarshaller.unmarshall(toMarshall)).toStrictEqual({
                uuid: 'ad3sdf3adcklja3!53',
                contentRef: '3sdfdkl3fsdsf',
                explanation: 'You should have chosen this option because...',
                subjectImageArea: [
                    {
                        x: 90,
                        y: 90,
                    },
                ],
            } as TestPackageOption);
        });
    });
});
