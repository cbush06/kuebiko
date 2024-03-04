import { KuebikoDb } from '@renderer/db/kuebiko-db';

const fetchQuestions = async (questionUuids: string[]) =>
    await KuebikoDb.INSTANCE.questions.bulkGet(questionUuids);

export const QuestionsService = {
    fetchQuestions,
};
