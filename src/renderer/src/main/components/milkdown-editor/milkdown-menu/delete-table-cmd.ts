import { deleteTable } from '@milkdown/prose/tables';
import { $command } from '@milkdown/utils';

const deleteTableCommand = $command(
    'DeleteTable',
    () => () => (state, dispatch) => deleteTable(state, dispatch),
);

Object.assign(deleteTableCommand, {
    meta: {
        group: 'Table',
        displayName: 'Command<DeleteTable>',
    },
});

export { deleteTableCommand };
