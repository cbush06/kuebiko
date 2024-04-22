import { Question } from '@renderer/db/models/question';
import { Test } from '@renderer/db/models/test';
import ConfigureVue from '@renderer/pages/testing/children/Configure.vue';
import userEvent from '@testing-library/user-event';
import { fireEvent, render, waitFor } from '@testing-library/vue';

vi.mock('vue-router', () => ({
    useRoute: vi.fn().mockImplementation(() => ({
        params: {
            testUuid: '824739e4-a3f9-42b8-af78-a84b70c3854b',
        },
    })),
}));

vi.mock('@renderer/services/tests-service.ts', () => {
    return {
        TestsService: {
            fetchTest: vitest.fn().mockImplementation(
                () =>
                    ({
                        uuid: '824739e4-a3f9-42b8-af78-a84b70c3854b',
                        version: 1,
                        title: 'Kuebiko 101',
                        authors: [],
                        created: new Date(2024, 1, 1), // Feb 1, 2024
                        resourceRefs: [],
                        sections: [
                            {
                                default: false,
                                questionRefs: [
                                    'b4983a44-4af3-43cb-9f38-f1a08c6e9c2d',
                                    '50c274a5-cc12-4fee-9b6d-5fa6ae05ef9f',
                                ],
                                title: 'Section 1',
                                uuid: 'd0a1dbd7-70f4-4738-ae4e-3998a1390b70',
                            },
                            {
                                default: false,
                                questionRefs: [
                                    'c1cc99fd-2ae6-4c55-b97b-403496002f2a',
                                    '9bd9f6da-ce88-4c58-9bff-600f72fc096e',
                                ],
                                title: 'Section 2',
                                uuid: '435ba64b-1f72-4990-817d-1a3ba42f4179',
                            },
                        ],
                        tags: [],
                        passingPercentage: 0.75,
                        allowedTime: 3600000, // 60 mins
                    }) as Test,
            ),
        },
    };
});

vi.mock('@renderer/services/questions-service.ts', () => {
    return {
        QuestionsService: {
            fetchQuestions: vitest.fn().mockImplementation(
                () =>
                    [
                        {
                            uuid: 'b4983a44-4af3-43cb-9f38-f1a08c6e9c2d',
                            contentRef: 'What is 2+2?',
                            type: 'MULTIPLE',
                            answer: '6a13d8b9-1e67-4d4d-ad0d-b4427fbced30',
                            options: [
                                {
                                    uuid: 'fe756745-05c3-42ff-bfbe-bd77e77b697b',
                                    contentRef: '5',
                                    explanation: '2+2 is not 5',
                                },
                                {
                                    uuid: '6a13d8b9-1e67-4d4d-ad0d-b4427fbced30',
                                    contentRef: '4',
                                    explanation: '2+2 is always 4',
                                },
                            ],
                            successFeedbackText: "Great job! You're a math wiz!",
                            failureFeedbackText: 'Uh oh! 2+2 is 4!',
                            categories: ['math', 'addition'],
                        },
                        {
                            uuid: '50c274a5-cc12-4fee-9b6d-5fa6ae05ef9f',
                            contentRef: 'What is the process by which plants make energy?',
                            type: 'MULTIPLE',
                            answer: '57681777-ab75-4404-963e-aa7811d68974',
                            options: [
                                {
                                    uuid: '57681777-ab75-4404-963e-aa7811d68974',
                                    contentRef: 'Photosynthesis',
                                    explanation:
                                        'Great! Plants convert carbon dixoide and water into energy via photosynthesis!',
                                },
                                {
                                    uuid: 'b4ef0dd6-9783-4c69-9467-0e154d58ad5a',
                                    contentRef: 'Hydrolysis',
                                    explanation:
                                        'No, if plants split water into its constituent molecules they would die.',
                                },
                            ],
                            successFeedbackText: 'Great job! You are a biology wiz!',
                            failureFeedbackText: 'Uh oh! Try photosynthesis.',
                            categories: ['biology', 'plant life'],
                        },
                        {
                            uuid: 'c1cc99fd-2ae6-4c55-b97b-403496002f2a',
                            contentRef:
                                'What is the cycle of waters movement through the ecosystem called?',
                            type: 'MULTIPLE',
                            answer: '29926c5b-1534-4b0b-be1b-358f26043b97',
                            options: [
                                {
                                    uuid: 'fbb01a44-987b-4817-82ed-bcf20106e9e5',
                                    contentRef: 'The Circle of Life',
                                    explanation: 'Sorry, this is not The Lion King.',
                                },
                                {
                                    uuid: '29926c5b-1534-4b0b-be1b-358f26043b97',
                                    contentRef: 'The Water Cycle',
                                    explanation: 'Correct! It is the water cycle.',
                                },
                            ],
                            successFeedbackText: 'Well, done!',
                            failureFeedbackText: 'Go back to third grade.',
                            categories: ['biology', 'water cycle'],
                        },
                        {
                            uuid: '9bd9f6da-ce88-4c58-9bff-600f72fc096e',
                            contentRef: 'Where do babies come from?',
                            type: 'MULTIPLE',
                            answer: 'c6722f02-091e-4c68-bc18-ab14d6403017',
                            options: [
                                {
                                    uuid: 'c6722f02-091e-4c68-bc18-ab14d6403017',
                                    contentRef: 'Storks',
                                    explanation: 'Correct! They are brought by massive birds.',
                                },
                                {
                                    uuid: '2210e912-db46-4d68-933a-627395ab88d1',
                                    contentRef: 'Pixie Dust',
                                    explanation:
                                        'Sorry, pixie dust makes you fly but does not create new humans.',
                                },
                            ],
                            successFeedbackText: 'Well, done!',
                            failureFeedbackText: 'Study your fairy tales a little more.',
                            categories: ['biology', 'reproduction'],
                        },
                    ] as Question[],
            ),
        },
    };
});

describe('configure test page', () => {
    it('shows duration setting for "Simulate" mode only', async () => {
        const { getByTestId, queryByTestId } = render(ConfigureVue);
        const simulateRadio = getByTestId('test-delivery-mode-simulate') as HTMLInputElement;
        const prepareRadio = getByTestId('test-delivery-mode-prepare') as HTMLInputElement;

        expect(simulateRadio).toBeChecked();
        expect(getByTestId('configure-duration')).toBeInTheDocument();

        fireEvent.click(prepareRadio);
        await waitFor(() => expect(queryByTestId('configure-duration')).not.toBeInTheDocument());
    });

    it('shows question filters only for randomized ordering', async () => {
        const { getByTestId, queryByTestId } = render(ConfigureVue);

        const originalRadio = getByTestId('question-ordering-original');
        const randomRadio = getByTestId('question-ordering-random');
        const randomBySectionRadio = getByTestId('question-ordering-random-by-section');

        expect(originalRadio).toBeChecked();
        expect(queryByTestId('question-filters')).not.toBeInTheDocument();

        fireEvent.click(randomRadio);
        await waitFor(() => expect(queryByTestId('question-filters')).toBeInTheDocument());

        fireEvent.click(randomBySectionRadio);
        await new Promise((r) => setTimeout(r, 50)); // wait 50ms to ensure changes propogate
        await waitFor(() => expect(queryByTestId('question-filters')).toBeInTheDocument());
    });

    it('shows correct options for filtering by section and category', async () => {
        const { getByTestId } = render(ConfigureVue);

        // Set ordering to random
        fireEvent.click(getByTestId('question-ordering-random'));

        // Confirm filters are shown
        const sectionFilter = getByTestId('section-filter');
        const categoryFilter = getByTestId('category-filter');

        // Confirm correct sections are available
        await waitFor(() =>
            expect(sectionFilter.querySelectorAll('li[role="option"]').item(0)).toBeInTheDocument(),
        );
        const sectionOptions = Array.from(sectionFilter.querySelectorAll('li[role="option"]')).map(
            (e) => e.textContent,
        );
        expect(sectionOptions).toEqual(['Section 1', 'Section 2']);

        // Confirm correct categories are shown
        const categoryOptions = Array.from(
            categoryFilter.querySelectorAll('li[role="option"]'),
        ).map((e) => e.textContent);
        expect(categoryOptions).toEqual([
            'addition',
            'biology',
            'math',
            'plant life',
            'reproduction',
            'water cycle',
        ]);
    });

    it('updates max questions as filters are changed', async () => {
        const { getByTestId, findByTestId } = render(ConfigureVue);
        const user = userEvent.setup();

        // Set ordering to random
        fireEvent.click(getByTestId('question-ordering-random'));

        // Set section filter and check max questions
        const sectionFilter = await findByTestId('section-filter');
        await user.click(sectionFilter.querySelector('.multiselect__select') as HTMLElement);
        expect(sectionFilter.querySelector('li:first-child') as HTMLElement).toBeVisible();

        await user.type(
            sectionFilter.querySelector('.multiselect__input') as HTMLInputElement,
            '{Enter}{Escape}',
        );

        const maxQuestions = getByTestId('max-questions') as HTMLInputElement;
        const maxQuestionsValue = getByTestId('max-questions-value') as HTMLInputElement;

        await waitFor(() => expect(maxQuestions.max).toEqual('2'));
        expect(maxQuestionsValue).toHaveValue('2');

        const categoryFilter = getByTestId('category-filter');
        await user.click(categoryFilter.querySelector('.multiselect__select') as HTMLElement);
        expect(categoryFilter.querySelector('li:first-child') as HTMLElement).toBeVisible();

        await user.type(
            categoryFilter.querySelector('.multiselect__input') as HTMLInputElement,
            '{Enter}{Escape}',
        );

        await waitFor(() => expect(maxQuestions.max).toEqual('1'));
        expect(maxQuestionsValue).toHaveValue('1');
    });
});
