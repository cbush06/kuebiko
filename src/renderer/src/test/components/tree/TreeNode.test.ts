import TreeNode, { TreeNodeProps } from '@renderer/components/tree/TreeNode.vue';
import { TreeNodeDragData } from '@renderer/components/tree/structures';
import userEvent from '@testing-library/user-event';
import { fireEvent, render } from '@testing-library/vue';

describe('TreeNode component', () => {
    const uuid = '388090ee-3b07-4188-9a5f-e1ab6c9ade15';
    const renderTreeNode = (extraProps: Partial<TreeNodeProps> = {}) =>
        render(TreeNode, {
            props: {
                ...extraProps,
                id: uuid,
                label: 'My Tree Node',
                iconClass: 'fas fa-file',
            } as TreeNodeProps,
        });

    it('renders correctly', () => {
        const { getByTestId, queryByTestId } = renderTreeNode();

        expect(getByTestId(`tree-node-text-${uuid}`)).toHaveTextContent('My Tree Node');
        expect(getByTestId(`tree-node-icon-${uuid}`)).toHaveClass('fas', 'fa-file');
        expect(queryByTestId(`tree-node-children-${uuid}`)).not.toBeInTheDocument();
        expect(queryByTestId(`tree-node-expander-${uuid}`)).not.toBeInTheDocument();
    });

    it('renders correctly as a container', async () => {
        const uuid2 = '7272baf4-2faa-4468-b372-b8e5c17fdb6d';

        const user = userEvent.setup();
        const { getByTestId, queryByTestId } = renderTreeNode({
            iconClass: 'fas fa-folder',
            isContainer: true,
            isExpanded: false,
            children: [
                {
                    id: uuid2,
                    label: 'My Child Node',
                    iconClass: 'fas fa-file',
                },
            ],
        } as TreeNodeProps);

        expect(queryByTestId(`tree-node-children-${uuid}`)).toBeInTheDocument();
        expect(queryByTestId(`tree-node-children-${uuid}`)).toHaveClass('is-hidden');
        expect(queryByTestId(`tree-node-expander-${uuid}`)).toBeInTheDocument();

        // Expand it
        await user.click(getByTestId(`tree-node-expander-${uuid}`));
        expect(queryByTestId(`tree-node-children-${uuid}`)).not.toHaveClass('is-hidden');
    });

    it('emits select event on click', async () => {
        const { emitted, getByTestId } = renderTreeNode();
        const user = userEvent.setup();
        await user.click(getByTestId(`tree-node-label-${uuid}`));
        expect(emitted('select').length).toBe(1);
    });

    it('should emit a drop event when a node is dropped on it', async () => {
        const { emitted, getByTestId } = renderTreeNode();
        const moved = {
            sourceId: 'ca7652ea-8076-4a73-aa09-e26c8ffbced8',
            parentId: '7979e179-db1a-4b19-b301-d59976cb263b',
        } as TreeNodeDragData;
        const dataTransfer = {
            getData: vi.fn().mockImplementation((prop) => {
                if (prop === 'drag-data') return JSON.stringify(moved);
                return undefined;
            }),
        } as unknown as DataTransfer;

        await fireEvent.drop(getByTestId(`tree-node-label-${uuid}`), { dataTransfer });

        const dropEvent = emitted('drop');
        expect(dropEvent).toHaveLength(1);
        expect(dropEvent[0]).toHaveLength(1);
        expect(dropEvent[0]![0]).toEqual(
            expect.objectContaining({
                sourceId: moved.sourceId,
                parentId: moved.parentId,
                targetId: uuid,
                beforeId: undefined,
                afterId: undefined,
            }),
        );
    });

    it("should emit a drop event when a node is dropped at the top of it's children", async () => {
        const beforeUuid = 'd5e177bd-d201-4713-bbef-8f53ca35d5a5';

        const { emitted, getByTestId } = renderTreeNode({
            iconClass: 'fas fa-folder',
            isContainer: true,
            isExpanded: false,
            children: [
                {
                    id: beforeUuid,
                    label: 'Existing Child',
                    iconClass: 'fas fa-file',
                },
            ],
        });

        const moved = {
            sourceId: 'ca7652ea-8076-4a73-aa09-e26c8ffbced8',
            parentId: '7979e179-db1a-4b19-b301-d59976cb263b',
        } as TreeNodeDragData;
        const dataTransfer = {
            getData: vi.fn().mockImplementation((prop) => {
                if (prop === 'drag-data') return JSON.stringify(moved);
                return undefined;
            }),
        } as unknown as DataTransfer;

        await fireEvent.drop(getByTestId(`tree-node-children-before-drop-line-${uuid}`), {
            dataTransfer,
        });

        const dropEvent = emitted('drop');
        expect(dropEvent).toHaveLength(1);
        expect(dropEvent[0]).toHaveLength(1);
        expect(dropEvent[0]![0]).toEqual(
            expect.objectContaining({
                sourceId: moved.sourceId,
                parentId: moved.parentId,
                targetId: uuid,
                beforeId: beforeUuid,
                afterId: undefined,
            }),
        );
    });

    it('should emit a drop event when a child is dropped after it', async () => {
        const parentUuid = '30f02632-0432-4934-91b2-876e3cfe9c44';

        const { emitted, getByTestId } = renderTreeNode({
            // @ts-expect-error
            parent: { id: parentUuid },
        });

        const moved = {
            sourceId: 'ca7652ea-8076-4a73-aa09-e26c8ffbced8',
            parentId: '7979e179-db1a-4b19-b301-d59976cb263b',
        } as TreeNodeDragData;
        const dataTransfer = {
            getData: vi.fn().mockImplementation((prop) => {
                if (prop === 'drag-data') return JSON.stringify(moved);
                return undefined;
            }),
        } as unknown as DataTransfer;

        await fireEvent.drop(getByTestId(`tree-node-children-after-drop-line-${uuid}`), {
            dataTransfer,
        });

        const dropEvent = emitted('drop');
        expect(dropEvent).toHaveLength(1);
        expect(dropEvent[0]).toHaveLength(1);
        expect(dropEvent[0]![0]).toEqual(
            expect.objectContaining({
                sourceId: moved.sourceId,
                parentId: moved.parentId,
                targetId: parentUuid,
                beforeId: undefined,
                afterId: uuid,
            }),
        );
    });
});
