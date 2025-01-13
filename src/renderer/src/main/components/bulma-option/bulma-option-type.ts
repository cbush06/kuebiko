export interface BulmaOptionType {
    name: string;
    selected: boolean;
    value?: any;
}

export type BulmaOptionListener = (option: BulmaOptionType) => void;
