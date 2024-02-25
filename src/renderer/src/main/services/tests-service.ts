import { KuebikoDb } from '@renderer/db/kuebiko-db';
import { from } from '@vueuse/rxjs';
import { liveQuery } from 'dexie';

// prettier-ignore
const fetchAllTests = () => from(
    liveQuery(async () => 
        KuebikoDb.INSTANCE.tests.toArray()
    )
);

export const TestsService = {
    fetchAllTests,
};
