import { KuebikoDbFacade } from './kuebiko-db-facade';
import { KuebikoDb } from '@renderer/db/kuebiko-db';

export const DeliveryDbFacade: KuebikoDbFacade = {
    INSTANCE: KuebikoDb.INSTANCE,
    questions: KuebikoDb.INSTANCE.questions,
    resources: KuebikoDb.INSTANCE.resources,
    tests: KuebikoDb.INSTANCE.tests,
};
