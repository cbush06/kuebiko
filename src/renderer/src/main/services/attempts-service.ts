import { KuebikoDb } from '@renderer/db/kuebiko-db';
import { Attempt } from '@renderer/db/models/attempt';
import { from } from '@vueuse/rxjs';
import Dexie, { liveQuery } from 'dexie';

export interface AttemptTestRollup {
    testUuid: string;
    testTitle: string;
    lastAttempt: Date;
    lastScore: number;
    attemptCount: number;
}

const fetchAttemptRollupByTest = () =>
    from(
        liveQuery(async () => {
            const attempts = await KuebikoDb.INSTANCE.attempts
                .where('status')
                .equals('COMPLETED')
                .toArray();
            const tests = await Dexie.Promise.all(
                attempts.map(
                    async (a) =>
                        await KuebikoDb.INSTANCE.tests.where('uuid').equals(a.testRef).first(),
                ),
            );

            return Array.from(
                attempts
                    .reduce((map, next, i) => {
                        let entry = map.get(next.testRef);

                        if (!entry) {
                            map.set(next.testRef, {
                                testUuid: next.testRef,
                                testTitle: tests[i]!.title,
                                lastAttempt: next.completed!,
                                lastScore: next.score,
                                attemptCount: 1,
                            });
                        } else {
                            if (next.completed! > entry.lastAttempt) {
                                entry.lastAttempt = next.completed!;
                                entry.lastScore = next.score;
                            }
                            entry.attemptCount++;
                        }

                        return map;
                    }, new Map<string, AttemptTestRollup>())
                    .values(),
            );
        }),
    );

// prettier-ignore
const fetchAttemptHistoryForTest = (testUuid: string) => from(
    liveQuery(async () =>
        (await KuebikoDb.INSTANCE
            .attempts
            .where('testRef').equals(testUuid)
            .and(a => a.status === 'COMPLETED')
            .sortBy('completed')).reverse()
    ));

const fetchAttempt = (attemptUuid: string) => KuebikoDb.INSTANCE.attempts.get(attemptUuid);

const addAttempt = (attempt: Attempt) => KuebikoDb.INSTANCE.attempts.add(attempt);

export const AttemptsService = {
    fetchAttemptRollupByTest,
    fetchAttemptHistoryForTest,
    fetchAttempt,
    addAttempt,
};
