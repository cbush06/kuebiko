import { KuebikoDb } from '@renderer/db/kuebiko-db';
import { KuebikoDbFacade } from '@renderer/services/kuebiko-db-facade';

export const EditorDbFacade: KuebikoDbFacade = {
    INSTANCE: KuebikoDb.INSTANCE,
    questions: KuebikoDb.INSTANCE.editorQuestions,
    resources: KuebikoDb.INSTANCE.editorResources,
    tests: KuebikoDb.INSTANCE.editorTests,
};
