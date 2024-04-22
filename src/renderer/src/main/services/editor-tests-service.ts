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
const fetchTest = (testUuid: string) => KuebikoDb.INSTANCE.editorTests.get(testUuid);

export const EditorTestsService = {
    fetchAllTests,
    fetchTest,
};
