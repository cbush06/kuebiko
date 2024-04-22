import { KuebikoDb } from '@renderer/db/kuebiko-db';
import { Section } from '@renderer/db/models/section';
import { QuestionMarshaller } from '@renderer/services/test-package-service/marshallers/question-marshaller';
import { SectionMarshaller } from '@renderer/services/test-package-service/marshallers/section-marshaller';
import { Manifest } from '@renderer/services/test-package-service/model/manifest';
import { TestPackageQuestion } from '@renderer/services/test-package-service/model/test-package-question';
import { TestPackageSection } from '@renderer/services/test-package-service/model/test-package-section';
import JSZip from 'jszip';
import { Mock, beforeEach, describe, expect, test, vi } from 'vitest';

// Mock the DB
vi.mock('@renderer/db/kuebiko-db.ts', () => {
    const KuebikoDb = vi.fn();
    KuebikoDb.prototype.questions = {
        add: vi.fn().mockImplementation(() => Promise.resolve()),
    };
    return {
        KuebikoDb,
    };
});

describe('section marshaller', async () => {
    const questionMarshaller = {
        unmarshall: vi.fn(() => ({ uuid: 'dskd83rlk' })),
    } as unknown as QuestionMarshaller;

    let sectionMarshaller = new SectionMarshaller(
        {} as JSZip,
        {} as unknown as Manifest,
        new KuebikoDb(),
        questionMarshaller,
    );

    const toUnmarshal = {
        uuid: 'ab3ac23vfkjf',
        default: true,
        title: 'section',
        questions: [
            {
                uuid: 'dskd83rlk',
                type: 'MULTIPLE',
                answer: 'answer',
                options: [
                    {
                        uuid: 'abe38dkd',
                        contentRef: 'choice 1',
                    },
                    {
                        uuid: '3kdaf83',
                        contentRef: 'choice 2',
                    },
                ],
                categories: ['example'],
            },
        ] as TestPackageQuestion[],
    } as TestPackageSection;

    beforeEach(() => {
        (questionMarshaller.unmarshall as Mock).mockClear();
    });

    test('unmarshalls fields', async () => {
        expect(await sectionMarshaller.unmarshall(toUnmarshal)).toStrictEqual({
            uuid: 'ab3ac23vfkjf',
            default: true,
            descriptionRef: undefined,
            title: 'section',
            questionRefs: ['dskd83rlk'],
        } as Section);
    });
});
