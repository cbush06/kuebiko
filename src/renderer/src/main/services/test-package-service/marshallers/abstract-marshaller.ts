import { KuebikoDb } from '@renderer/db/kuebiko-db';
import JSZip from 'jszip';
import { Manifest } from '../model/manifest';

/**
 * Abstract class for marshallers used to convert data between the form stored in the database
 * and the form written to a Test Package file.
 *
 * @param M The model type. This should be the type persisted to the database.
 * @param P The package type. This should be the type written to a Test Package as JSON.
 */
export abstract class AbstractMarshaller<M, P> {
    constructor(
        protected jszip: JSZip,
        protected manifest: Manifest,
        protected db: KuebikoDb,
    ) {}

    abstract marshal(o: M): Promise<P>;

    abstract unmarshall(o: P): Promise<M>;
}
