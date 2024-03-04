import { KuebikoDb } from '@renderer/db/kuebiko-db';
import { Resource } from '@renderer/db/models/resource';

const fetchResource: (resourceRef: string) => Promise<Resource | undefined> = async (
    resourceRef: string,
) => {
    // prettier-ignore
    return await KuebikoDb.INSTANCE.resources
        .where('uuid')
        .equals(resourceRef)
        .first();
};

export const ResourcesService = {
    fetchResource,
};
