import { KuebikoDb } from '@renderer/db/kuebiko-db';

const fetchQuestion = (questionUuid: string) => KuebikoDb.INSTANCE.questions.get(questionUuid);

const fetchQuestions = (questionUuids: string[]) =>
    KuebikoDb.INSTANCE.questions.bulkGet(questionUuids);

export const QuestionsService = {
    fetchQuestion,
    fetchQuestions,
};
