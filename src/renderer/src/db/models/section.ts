export interface Section {
    uuid: string;
    default: boolean;
    title: string;
    descriptionText?: string;
    descriptionRef?: string;
    questionRefs: string[];
}
