import { KuebikoDb } from '@renderer/db/kuebiko-db';

const fetchResource = (resourceRef: string) => KuebikoDb.INSTANCE.resources.get(resourceRef);

const fetchResources = (resourceRefs: string[]) =>
    KuebikoDb.INSTANCE.resources.bulkGet(resourceRefs);

export const ResourcesService = {
    fetchResource,
    fetchResources,
};
