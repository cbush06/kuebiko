import JSZip from 'jszip';
import { Manifest } from '../model/manifest';
import { KuebikoDbFacade } from '@renderer/services/kuebiko-db-facade';

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
        protected db: KuebikoDbFacade,
        protected manifest?: Manifest,
    ) {}

    abstract marshall(o: M): Promise<P>;

    abstract unmarshall(o: P): Promise<M>;
}
