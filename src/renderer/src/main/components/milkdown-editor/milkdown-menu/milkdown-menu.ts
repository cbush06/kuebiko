import { MenuConfigItem, menuConfigCtx } from '@milkdown-lab/plugin-menu';
import { editorStateCtx, rootCtx, schemaCtx } from '@milkdown/core';
import { Ctx } from '@milkdown/ctx';
import { listenerCtx } from '@milkdown/plugin-listener';
import { MarkType } from '@milkdown/prose/model';
import { EditorState } from '@milkdown/prose/state';
import { deleteColumnCommand } from './delete-column-cmd';
import { deleteRowCommand } from './delete-row-cmd';
import { deleteTableCommand } from './delete-table-cmd';
import { ImageSelectorCallback, ImageSelectorCommand } from './image-selector-cmd';
import './milkdown-menu.scss';

const createIconContent = (clazz: string, label?: string) => {
    const wrapper = document.createElement('span') as HTMLElement;
    if (label) {
        wrapper.appendChild(document.createTextNode(label));
    }
    const i = wrapper.appendChild(document.createElement('i') as HTMLElement);
    i.className = clazz;
    return wrapper;
};

const hasMark = (state: EditorState, type: MarkType | undefined): boolean => {
    if (!type) return false;
    const { from, $from, to, empty } = state.selection;
    if (empty) return !!type.isInSet(state.storedMarks || $from.marks());

    return state.doc.rangeHasMark(from, to, type);
};

export const customMenuCommands = (imageSelectorCallback: ImageSelectorCallback) => [
    deleteColumnCommand,
    deleteRowCommand,
    deleteTableCommand,
    ImageSelectorCommand(imageSelectorCallback),
];

const buildMenu = () => {
    return [
        [
            {
                type: 'select',
                text: 'Heading',
                options: [
                    {
                        id: 1,
                        content: createIconContent('mdi mdi-22px mdi-format-header-1', 'Heading 1'),
                    },
                    {
                        id: 2,
                        content: createIconContent('mdi mdi-22px mdi-format-header-2', 'Heading 2'),
                    },
                    {
                        id: 3,
                        content: createIconContent('mdi mdi-22px mdi-format-header-3', 'Heading 3'),
                    },
                    { id: 0, content: 'Plain Text' },
                ],
                onSelect: (id) => (!!id ? ['WrapInHeading', id] : ['TurnIntoText', null]),
            },
        ],
        [
            {
                type: 'button',
                content: createIconContent('mdi mdi-22px mdi-format-bold'),
                key: 'ToggleStrong',
                active: (ctx) => {
                    const state = ctx.get(editorStateCtx);
                    const schema = ctx.get(schemaCtx);
                    return hasMark(state, schema.marks.strong);
                },
            },
            {
                type: 'button',
                content: createIconContent('mdi mdi-22px mdi-format-italic'),
                key: 'ToggleEmphasis',
                active: (ctx) => {
                    const state = ctx.get(editorStateCtx);
                    const schema = ctx.get(schemaCtx);
                    return hasMark(state, schema.marks.emphasis);
                },
            },
            {
                type: 'button',
                content: createIconContent('mdi mdi-22px mdi-format-strikethrough'),
                key: 'ToggleStrikethrough',
                active: (ctx) => {
                    const state = ctx.get(editorStateCtx);
                    const schema = ctx.get(schemaCtx);
                    return hasMark(state, schema.marks.strike_through);
                },
            },
        ],
        [
            {
                type: 'button',
                content: createIconContent('mdi mdi-22px mdi-format-list-bulleted'),
                key: 'WrapInBulletList',
            },
            {
                type: 'button',
                content: createIconContent('mdi mdi-22px mdi-format-list-numbered'),
                key: 'WrapInOrderedList',
            },
            {
                type: 'button',
                content: createIconContent('mdi mdi-22px mdi-format-indent-decrease'),
                key: 'LiftListItem',
            },
            {
                type: 'button',
                content: createIconContent('mdi mdi-22px mdi-format-indent-increase'),
                key: 'SinkListItem',
            },
        ],
        [
            {
                type: 'button',
                content: createIconContent('mdi mdi-22px mdi-link-variant'),
                key: ['ToggleLink', { href: '' }],
            },

            {
                type: 'button',
                content: createIconContent('mdi mdi-22px mdi-image-plus'),
                key: ['ImageSelector'],
            },
        ],
        [
            {
                type: 'select',
                text: 'Table',
                options: [
                    {
                        id: 'InsertTable, 3, 3',
                        content: createIconContent('mdi mdi-22px mdi-table-plus', 'Add Table'),
                    },
                    {
                        id: 'DeleteTable',
                        content: createIconContent('mdi mdi-22px mdi-table-remove', 'Remove Table'),
                    },
                    {
                        id: 'AddColBefore',
                        content: createIconContent(
                            'mdi mdi-22px mdi-table-column-plus-before',
                            'Add Column',
                        ),
                    },
                    {
                        id: 'AddColAfter',
                        content: createIconContent(
                            'mdi mdi-22px mdi-table-column-plus-after',
                            'Add Column',
                        ),
                    },
                    {
                        id: 'AddRowBefore',
                        content: createIconContent(
                            'mdi mdi-22px mdi-table-row-plus-before',
                            'Add Row',
                        ),
                    },
                    {
                        id: 'AddRowAfter',
                        content: createIconContent(
                            'mdi mdi-22px mdi-table-row-plus-after',
                            'Add Row',
                        ),
                    },
                    {
                        id: 'DeleteColumn',
                        content: createIconContent(
                            'mdi mdi-22px mdi-table-column-remove',
                            'Remove Column',
                        ),
                    },
                    {
                        id: 'DeleteRow',
                        content: createIconContent(
                            'mdi mdi-22px mdi-table-row-remove',
                            'Remove Row',
                        ),
                    },
                ],
                onSelect: (id: string) => id.split(','),
            },
        ],
        [
            {
                type: 'button',
                content: createIconContent('mdi mdi-22px mdi-code-block-tags'),
                key: 'CreateCodeBlock',
            },
        ],
        [
            {
                type: 'button',
                content: createIconContent('mdi mdi-22px mdi-format-quote-open'),
                key: 'WrapInBlockquote',
            },
            {
                type: 'button',
                content: createIconContent('mdi mdi-22px mdi-minus'),
                key: 'InsertHr',
            },
        ],
    ] as MenuConfigItem[][];
};

export const menuConfig = (ctx: Ctx) => {
    ctx.set(menuConfigCtx.key, {
        attributes: { class: 'milkdown-menu', 'data-menu': 'true' },
        items: buildMenu(),
    });

    // Give focus back to editor after a menu selection is made
    const listener = ctx.get(listenerCtx);
    listener.mounted((ctx) => {
        // Register event listeners on all menu buttons
        const root = ctx.get(rootCtx) as HTMLElement;
        const editor = root.querySelector('.editor[contenteditable=true]') as HTMLElement;
        root.querySelectorAll(
            '.milkdown-menu button:not([aria-haspopup]), li[role="menuitem"]',
        ).forEach((e) => (e as HTMLElement).addEventListener('click', () => editor.focus()));
    });
};
