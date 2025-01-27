import ManyChoiceVue from '@renderer/components/question-renderers/ManyChoice.vue';
import { Option } from '@renderer/db/models/option';
import { Resource } from '@renderer/db/models/resource';
import userEvent from '@testing-library/user-event';
import { render } from '@testing-library/vue';

const mockOptionContents = new Map<string, string>([
    ['4934305b-3f71-4489-b38e-fbab7c6a991c', '∛8 = 2'],
    ['b7f5d6f7-ab01-478a-9147-31f5a591b5ad', '√4 = 2'],
    ['e25acb29-0336-4c85-8f9d-c36b611db55e', '∛125 = 6'],
]);

vi.mock('@renderer/services/delivery-test-object-provider.ts', () => ({
    DeliveryTestObjectProvider: {
        fetchResource: vi.fn().mockImplementation((uuid: string) =>
            Promise.resolve({
                uuid,
                name: '',
                type: 'MARKDOWN',
                mime: '',
                sha256: '',
                data: mockOptionContents.get(uuid),
            } as Resource),
        ),
    },
}));

describe('many choice component', () => {
    const options = [
        {
            uuid: '36973a42-dba8-40e8-aa6a-6d9f71dffacf',
            contentRef: 'b7f5d6f7-ab01-478a-9147-31f5a591b5ad',
            explanation: '2 x 2 = 4; therefore, the square root of 4 is 2.',
        },
        {
            uuid: '63551a06-08fd-4c08-a11e-337e728bb1cf',
            contentRef: '4934305b-3f71-4489-b38e-fbab7c6a991c',
            explanation: '2 x 2 x 2 = 8; therefore, the cubed root of 8 is 2.',
        },
        {
            uuid: 'fdd4a076-4d4c-4242-bcc1-e68ab243db11',
            contentRef: 'e25acb29-0336-4c85-8f9d-c36b611db55e',
            explanation: '5 x 5 x 5 = 125; therefore, the cubed root of 125 is 5, not 6.',
        },
    ] as Option[];

    const correctResponse = [
        '36973a42-dba8-40e8-aa6a-6d9f71dffacf',
        '63551a06-08fd-4c08-a11e-337e728bb1cf',
    ];

    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('renders available options with both text and resource content', async () => {
        const { getByText } = render(ManyChoiceVue, {
            props: {
                options,
                correctResponse,
                questionRef: '',
                questionContent: 'Select all valid statements.',
            },
        });

        // Advance timers so async methods are executed and options are rendered
        await vi.runAllTimersAsync();

        expect(
            getByText('Select all valid statements.', { selector: '.content *' }),
        ).toBeInTheDocument();
        expect(getByText('√4 = 2', { selector: 'label *' })).toBeInTheDocument();
        expect(getByText('∛8 = 2', { selector: 'label *' })).toBeInTheDocument();
        expect(getByText('∛125 = 6', { selector: 'label *' })).toBeInTheDocument();
    });

    it('emits update event when selected value changes', async () => {
        const user = userEvent.setup({ delay: null }); // delay: null required due to fake timers
        const { getByTestId, emitted } = render(ManyChoiceVue, {
            props: {
                options,
                correctResponse,
                questionRef: '',
                questionContent: 'Select all valid statements:',
            },
        });

        // Advance timers so async methods are executed and options are rendered
        await vi.runAllTimersAsync();

        expect(getByTestId(`label-${options[0].uuid}`)).toBeInTheDocument();

        await user.click(getByTestId(`label-${options[0].uuid}`));

        const updateModelValue = emitted('update:modelValue');
        expect(updateModelValue[0]).toEqual([[options[0].uuid]]);
    });

    it('displays explanations when answers are revealed', async () => {
        const { getByText } = render(ManyChoiceVue, {
            props: {
                options,
                correctResponse,
                questionRef: '',
                questionContent: 'Select all valid statements:',
                revealAnswer: true,
            },
        });

        // Advance timers so async methods are executed and options are rendered
        await vi.runAllTimersAsync();

        options.forEach((o) => expect(getByText(o.explanation!)).toBeInTheDocument());
    });

    it('displays success feedback and styles responses appropriately when the user answers correctly and answers are revealed', async () => {
        const { getByTestId } = render(ManyChoiceVue, {
            props: {
                options,
                correctResponse,
                questionRef: '',
                questionContent: 'Select all valid statements:',
                revealAnswer: true,
                successFeedback: 'Great job!',
                modelValue: [
                    '36973a42-dba8-40e8-aa6a-6d9f71dffacf',
                    '63551a06-08fd-4c08-a11e-337e728bb1cf',
                ],
            },
        });

        // Advance timers so async methods are executed and options are rendered
        await vi.runAllTimersAsync();

        // expect correct answers to be styled in green
        correctResponse.forEach((r) => {
            expect(getByTestId(`field-${r}`)).toHaveClass('has-background-success-light');
            expect(getByTestId(`label-${r}`)).toHaveClass('has-text-success-dark');
        });

        // expect other answers to be styled in red
        options
            .filter((o) => !correctResponse.includes(o.uuid))
            .map((o) => o.uuid)
            .forEach((r) => {
                expect(getByTestId(`field-${r}`)).toHaveClass('has-background-danger-light');
                expect(getByTestId(`label-${r}`)).toHaveClass('has-text-danger-dark');
            });

        // expect success feedback to be shown
        expect(getByTestId('successFeedback')).toBeInTheDocument();
        expect(getByTestId('successFeedback')).toHaveTextContent('Great job!');
        expect(getByTestId('successFeedback')).toBeVisible();
    });

    it('displays failure feedback and styles responses appropriately when the user answers incorrectly and answers are revealed', async () => {
        const { getByTestId } = render(ManyChoiceVue, {
            props: {
                options,
                correctResponse,
                questionRef: '',
                questionContent: 'Select all valid statements:',
                revealAnswer: true,
                failureFeedback: 'Go study some more...',
            },
        });

        // Advance timers so async methods are executed and options are rendered
        await vi.runAllTimersAsync();

        // expect correct answers to be styled in green
        correctResponse.forEach((r) => {
            expect(getByTestId(`field-${r}`)).toHaveClass('has-background-success-light');
            expect(getByTestId(`label-${r}`)).toHaveClass('has-text-success-dark');
        });

        // expect other answers to be styled in red
        options
            .filter((o) => !correctResponse.includes(o.uuid))
            .map((o) => o.uuid)
            .forEach((r) => {
                expect(getByTestId(`field-${r}`)).toHaveClass('has-background-danger-light');
                expect(getByTestId(`label-${r}`)).toHaveClass('has-text-danger-dark');
            });

        // expect success feedback to be shown
        expect(getByTestId('failureFeedback')).toBeInTheDocument();
        expect(getByTestId('failureFeedback')).toHaveTextContent('Go study some more...');
        expect(getByTestId('failureFeedback')).toBeVisible();
    });
});
