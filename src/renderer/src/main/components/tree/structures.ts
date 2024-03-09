export interface TreeOptions {
    rootLabel: string;
    rootIcon?: string;
    reorderable?: boolean;
}

export interface TreeNode {
    id: string;
    label: string;
    iconClass?: string;
    container?: boolean;
    children?: TreeNode[];
    expanded?: boolean;
    disabled?: boolean;
}
