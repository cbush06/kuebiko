import { TestObjectProvider } from '@renderer/services/test-object-provider';
import { KuebikoDb } from '@renderer/db/kuebiko-db';
import { Test } from '@renderer/db/models/test';
import { Resource } from '@renderer/db/models/resource';
import { Question } from '@renderer/db/models/question';
import { FailedSaveError } from '@renderer/services/errors/failed-save';
import { EditorDbFacade } from '@renderer/services/editor-db-facade';

class EditorTestObjectProviderClass extends TestObjectProvider {
    constructor() {
        super(EditorDbFacade);
    }

    async saveTestAndRelations(test: Test, resources: Resource[], questions: Question[]) {
        await KuebikoDb.INSTANCE.transaction(
            'rw',
            [this.db.tests, this.db.resources, this.db.questions],
            async () => {
                await this.db.tests.put(test);
                await this.db.resources.bulkPut(resources);
                await this.db.questions.bulkPut(questions);
            },
        ).catch((e) => {
            throw new FailedSaveError('Failed to save Test and Relations from editor', {
                cause: e,
            });
        });
    }
}

export const EditorTestObjectProvider = new EditorTestObjectProviderClass();
