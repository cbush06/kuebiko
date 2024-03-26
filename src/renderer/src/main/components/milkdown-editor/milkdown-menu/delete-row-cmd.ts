import { deleteRow } from '@milkdown/prose/tables';
import { $command } from '@milkdown/utils';

const deleteRowCommand = $command(
    'DeleteRow',
    () => () => (state, dispatch) => deleteRow(state, dispatch),
);

Object.assign(deleteRowCommand, {
    meta: {
        group: 'Table',
        displayName: 'Command<DeleteRow>',
    },
});

export { deleteRowCommand };
