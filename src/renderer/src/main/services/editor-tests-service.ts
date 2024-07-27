import { KuebikoDb } from '@renderer/db/kuebiko-db';
import { Question } from '@renderer/db/models/question';
import { Resource } from '@renderer/db/models/resource';
import { Test } from '@renderer/db/models/test';
import { from } from '@vueuse/rxjs';
import { liveQuery } from 'dexie';
import { FailedSaveError } from './errors/failed-save';

// prettier-ignore
const fetchAllTests = () => from(
    liveQuery(async () => 
        KuebikoDb.INSTANCE.editorTests.toArray()
    )
);

// prettier-ignore
const fetchTest = (testUuid: string) => KuebikoDb.INSTANCE.editorTests.get(testUuid);

const saveTestAndRelations = async (test: Test, resources: Resource[], questions: Question[]) => {
    await KuebikoDb.INSTANCE.transaction(
        'rw',
        [
            KuebikoDb.INSTANCE.editorTests,
            KuebikoDb.INSTANCE.editorResources,
            KuebikoDb.INSTANCE.editorQuestions,
        ],
        async () => {
            await KuebikoDb.INSTANCE.editorTests.put(test);
            await KuebikoDb.INSTANCE.editorResources.bulkPut(resources);
            await KuebikoDb.INSTANCE.editorQuestions.bulkPut(questions);
        },
    ).catch((e) => {
        throw new FailedSaveError('Failed to save Test and Relations from editor', { cause: e });
    });
};

export const EditorTestsService = {
    fetchAllTests,
    fetchTest,
    saveTestAndRelations,
};
