import { listItemSchema } from '@milkdown/preset-commonmark';
import { $command } from '@milkdown/utils';
import { liftListItem } from 'prosemirror-schema-list';

// Had to create this myself due to error on line 121 of @milkdown/preset-commonmark/src/node/list-item.ts
// Created bug with milkdown: https://github.com/Milkdown/milkdown/issues/1270
const liftListItemCommand = $command(
    'KuebikoLiftListItem',
    (ctx) => () => liftListItem(listItemSchema.type(ctx)),
);

Object.assign(liftListItemCommand, {
    meta: {
        displayName: 'Command<liftListItemCommand>',
        group: 'ListItem',
    },
});

export { liftListItemCommand };
