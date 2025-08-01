import { liveQuery } from 'dexie';
import { Question } from '@renderer/db/models/question';
import { Resource } from '@renderer/db/models/resource';
import { Observable } from 'rxjs';
import { from } from '@vueuse/rxjs';
import { Test } from '@renderer/db/models/test';
import { KuebikoDbFacade } from '@renderer/services/kuebiko-db-facade';

export class TestObjectProvider {
    constructor(protected db: KuebikoDbFacade) {}

    fetchAllTests(): Observable<Array<Test>> {
        return from(liveQuery(async () => this.db.tests.toArray()));
    }

    fetchQuestion(questionUuid: string): Promise<Question | undefined> {
        return this.db.questions.get(questionUuid);
    }

    fetchQuestions(questionUuids: string[]): Promise<(Question | undefined)[]> {
        return this.db.questions.bulkGet(questionUuids);
    }

    fetchResource(resourceRef: string): Promise<Resource | undefined> {
        return this.db.resources.get(resourceRef);
    }

    fetchResources(resourceRefs: string[]): Promise<(Resource | undefined)[]> {
        return this.db.resources.bulkGet(resourceRefs);
    }

    fetchTest(testUuid: string): Promise<Test | undefined> {
        return this.db.tests.get(testUuid);
    }
}
