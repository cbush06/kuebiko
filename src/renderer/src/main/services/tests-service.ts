import { KuebikoDb } from '@renderer/db/kuebiko-db';
import { from } from '@vueuse/rxjs';
import { liveQuery } from 'dexie';

// prettier-ignore
const fetchAllTests = () => from(
    liveQuery(async () => 
        KuebikoDb.INSTANCE.tests.toArray()
    )
);

// prettier-ignore
const fetchTest = async (testUuid: string) => 
    await KuebikoDb.INSTANCE.tests
        .where('uuid')
        .equals(testUuid)
        .first();

export const TestsService = {
    fetchAllTests,
    fetchTest,
};
