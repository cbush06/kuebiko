import { deleteColumn } from '@milkdown/prose/tables';
import { $command } from '@milkdown/utils';

const deleteColumnCommand = $command(
    'DeleteColumn',
    () => () => (state, dispatch) => deleteColumn(state, dispatch),
);

Object.assign(deleteColumnCommand, {
    meta: {
        group: 'Table',
        displayName: 'Command<DeleteColumn>',
    },
});

export { deleteColumnCommand };
