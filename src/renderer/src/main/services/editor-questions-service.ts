import { KuebikoDb } from '@renderer/db/kuebiko-db';

const fetchQuestion = (questionUuid: string) =>
    KuebikoDb.INSTANCE.editorQuestions.get(questionUuid);

const fetchQuestions = (questionUuids: string[]) =>
    KuebikoDb.INSTANCE.editorQuestions.bulkGet(questionUuids);

export const EditorQuestionsService = {
    fetchQuestion,
    fetchQuestions,
};
