import ListEditorTests from '@renderer/pages/editor/children/ListEditorTests.vue';
import userEvent from '@testing-library/user-event';
import { render } from '@testing-library/vue';
import { of } from 'rxjs';
import { Mock } from 'vitest';
import { useRouter } from 'vue-router';
import { EditorTestObjectProvider } from '@renderer/services/editor-test-object-provider';

vi.mock('vue-router', () => ({
    useRouter: vi.fn(),
}));

describe('ListEditorTests component', () => {
    it('renders correctly', async () => {
        const fetchAllTestsSpy = vitest
            .spyOn(EditorTestObjectProvider, 'fetchAllTests')
            .mockReturnValue(
                of([
                    {
                        uuid: '4a297bf7-d63d-4e4b-ae8b-e40b8e4d4087',
                        title: 'Test #1',
                        version: 1,
                        authors: [],
                        created: new Date(),
                        resourceRefs: [],
                        sections: [],
                        tags: [],
                    },
                ]),
            );

        const user = userEvent.setup();

        const push = vi.fn();
        (useRouter as Mock).mockImplementationOnce(() => ({
            push,
        }));
        const { baseElement, getByText } = render(ListEditorTests);

        expect(fetchAllTestsSpy).toHaveBeenCalled();
        expect(getByText('Test #1')).toBeInTheDocument();

        await user.click(baseElement.querySelector('tbody > tr')!);

        expect(push).toHaveBeenCalledWith(`/editor/4a297bf7-d63d-4e4b-ae8b-e40b8e4d4087`);
    });
});
