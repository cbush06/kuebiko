export interface TreeNodeStruct {
    id: string;
    label: string;
    index?: number;
    iconClass?: string;
    children?: TreeNodeStruct[];
    isExpanded?: boolean;
    isDisabled?: boolean;
    isContainer?: boolean;
}

export interface TreeNodeDragData {
    sourceId: string;
    parentId: string;
}

export interface TreeNodeDropData extends TreeNodeDragData {
    targetId: string;
    afterId?: string;
    beforeId?: string;
}
