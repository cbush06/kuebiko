import { KuebikoDb } from '@renderer/db/kuebiko-db';

const fetchResource = (resourceRef: string) => KuebikoDb.INSTANCE.editorResources.get(resourceRef);

const fetchResources = (resourceRefs: string[]) =>
    KuebikoDb.INSTANCE.editorResources.bulkGet(resourceRefs);

export const EditorResourcesService = {
    fetchResource,
    fetchResources,
};
