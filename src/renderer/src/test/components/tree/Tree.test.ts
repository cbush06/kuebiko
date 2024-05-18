import Tree, { TreeOptions, TreeProps } from '@renderer/components/tree/Tree.vue';
import userEvent from '@testing-library/user-event';
import { render } from '@testing-library/vue';

describe('Tree component', () => {
    it('renders correctly', async () => {
        const rootUuid = '4ec96c13-584b-4bb4-9fb5-ea088537707e';
        const childContainerUuid = '13d562b3-d0a6-4105-b9dc-2baa0e84daa8';
        const nestedChildUuid = 'e35be9dd-6122-42ba-bc6a-7f59970840a8';

        const user = userEvent.setup();
        const { getByTestId } = render(Tree, {
            props: {
                rootNode: {
                    id: rootUuid,
                    label: 'My Tree',
                    isContainer: true,
                    children: [
                        {
                            id: childContainerUuid,
                            label: 'My Folder',
                            isContainer: true,
                            isExpanded: false,
                            children: [
                                {
                                    id: nestedChildUuid,
                                    label: 'My Leaf',
                                    iconClass: 'fas fa-file',
                                },
                            ],
                        },
                    ],
                },
                containerIcon: 'fas fa-folder',
                containerExpandedIcon: 'fas fa-folder-open',
            } as TreeOptions & TreeProps,
        });

        expect(getByTestId(`tree-node-icon-${rootUuid}`)).toHaveClass('fa-solid', 'fa-house');
        expect(getByTestId(`tree-node-text-${rootUuid}`)).toHaveTextContent('My Tree');

        expect(getByTestId(`tree-node-icon-${childContainerUuid}`)).toHaveClass('fas', 'fa-folder');
        expect(getByTestId(`tree-node-text-${childContainerUuid}`)).toHaveTextContent('My Folder');

        expect(getByTestId(`tree-node-children-${childContainerUuid}`)).toHaveClass('is-hidden');

        await user.click(getByTestId(`tree-node-expander-${childContainerUuid}`));

        expect(getByTestId(`tree-node-icon-${childContainerUuid}`)).toHaveClass(
            'fas',
            'fa-folder-open',
        );
        expect(getByTestId(`tree-node-children-${childContainerUuid}`)).not.toHaveClass(
            'is-hidden',
        );

        expect(getByTestId(`tree-node-icon-${nestedChildUuid}`)).toHaveClass('fas', 'fa-file');
        expect(getByTestId(`tree-node-text-${nestedChildUuid}`)).toHaveTextContent('My Leaf');
    });
});
