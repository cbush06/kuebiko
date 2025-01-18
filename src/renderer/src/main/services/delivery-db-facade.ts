import { KuebikoDbFacade } from './kuebiko-db-facade';
import { KuebikoDb } from '@renderer/db/kuebiko-db';

export const DeliveryDbFacade: KuebikoDbFacade = {
    questions: KuebikoDb.INSTANCE.questions,
    resources: KuebikoDb.INSTANCE.resources,
    tests: KuebikoDb.INSTANCE.tests,
};
