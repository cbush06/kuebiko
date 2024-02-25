export type ResourceType = 'IMAGE' | 'MARKDOWN' | 'AUDIO' | 'VIDEO';

export interface Resource {
    uuid: string;
    name: string;
    type: ResourceType;
    mime: string;
    sha256: string;
    data: Uint8Array | string;
}
