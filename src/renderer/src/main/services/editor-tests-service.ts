import { KuebikoDb } from '@renderer/db/kuebiko-db';
import { from } from '@vueuse/rxjs';
import { liveQuery } from 'dexie';

// prettier-ignore
const fetchAllTests = () => from(
    liveQuery(async () => 
        KuebikoDb.INSTANCE.editorTests.toArray()
    )
);

// prettier-ignore
const fetchTest = async (testUuid: string) => 
    await KuebikoDb.INSTANCE.editorTests
        .where('uuid')
        .equals(testUuid)
        .first();

export const EditorTestsService = {
    fetchAllTests,
    fetchTest,
};
