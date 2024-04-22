import { Attempt } from '@renderer/db/models/attempt';
import { Question } from '@renderer/db/models/question';
import { Test } from '@renderer/db/models/test';
import ResultsForAttemptVue from '@renderer/pages/attempts/children/ResultsForAttempt.vue';
import { fireEvent, render } from '@testing-library/vue';
import { of } from 'rxjs';

// Mock the ResizeObserver
const ResizeObserverMock = vi.fn(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
}));

// Stub the global ResizeObserver
vi.stubGlobal('ResizeObserver', ResizeObserverMock);

vi.mock('vue-router', () => ({
    useRoute: vi.fn().mockImplementation(() => ({
        params: {
            testUuid: '824739e4-a3f9-42b8-af78-a84b70c3854b',
            attemptUuid: 'a4a828bf-37b4-48a9-8d7d-81d051d41251',
        },
    })),
    useRouter: vi.fn(),
}));

vi.mock('@renderer/services/tests-service.ts', () => {
    return {
        TestsService: {
            fetchTest: vitest.fn().mockImplementation(
                () =>
                    ({
                        uuid: '824739e4-a3f9-42b8-af78-a84b70c3854b',
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
                    }) as unknown as Test,
            ),
        },
    };
});

const attempts = [
    {
        uuid: 'a4a828bf-37b4-48a9-8d7d-81d051d41251',
        testRef: '824739e4-a3f9-42b8-af78-a84b70c3854b',
        started: new Date(2024, 1, 2, 13, 30), // Feb 2, 2024 @ 1330
        completed: new Date(2024, 1, 2, 14, 0), // Feb 2, 2024 @ 1400
        status: 'COMPLETED',
        score: 0.75,
        questionResponses: [
            {
                credit: 1,
                questionRef: 'b4983a44-4af3-43cb-9f38-f1a08c6e9c2d',
                sectionRef: 'd0a1dbd7-70f4-4738-ae4e-3998a1390b70',
                response: '6a13d8b9-1e67-4d4d-ad0d-b4427fbced30',
            },
            {
                credit: 0,
                questionRef: '50c274a5-cc12-4fee-9b6d-5fa6ae05ef9f',
                sectionRef: 'd0a1dbd7-70f4-4738-ae4e-3998a1390b70',
                response: 'b4ef0dd6-9783-4c69-9467-0e154d58ad5a',
            },
            {
                credit: 1,
                questionRef: 'c1cc99fd-2ae6-4c55-b97b-403496002f2a',
                sectionRef: 'd0a1dbd7-70f4-4738-ae4e-3998a1390b70',
                response: '29926c5b-1534-4b0b-be1b-358f26043b97',
            },
            {
                credit: 1,
                questionRef: '9bd9f6da-ce88-4c58-9bff-600f72fc096e',
                sectionRef: 'd0a1dbd7-70f4-4738-ae4e-3998a1390b70',
                response: 'c6722f02-091e-4c68-bc18-ab14d6403017',
            },
        ],
        format: 'SIMULATE',
    },
    {
        uuid: '953e9bb1-f0db-4f1d-b2e7-d355ccc4af2e',
        testRef: '824739e4-a3f9-42b8-af78-a84b70c3854b',
        started: new Date(2024, 1, 2, 13, 30), // Feb 2, 2024 @ 1330
        completed: new Date(2024, 1, 2, 14, 0), // Feb 2, 2024 @ 1400
        status: 'COMPLETED',
        score: 0.25,
        questionResponses: [
            {
                credit: 1,
                questionRef: 'b4983a44-4af3-43cb-9f38-f1a08c6e9c2d',
                sectionRef: 'd0a1dbd7-70f4-4738-ae4e-3998a1390b70',
                response: '6a13d8b9-1e67-4d4d-ad0d-b4427fbced30',
            },
            {
                credit: 0,
                questionRef: '50c274a5-cc12-4fee-9b6d-5fa6ae05ef9f',
                sectionRef: 'd0a1dbd7-70f4-4738-ae4e-3998a1390b70',
                response: 'b4ef0dd6-9783-4c69-9467-0e154d58ad5a',
            },
            {
                credit: 0,
                questionRef: 'c1cc99fd-2ae6-4c55-b97b-403496002f2a',
                sectionRef: 'd0a1dbd7-70f4-4738-ae4e-3998a1390b70',
                response: 'fbb01a44-987b-4817-82ed-bcf20106e9e5',
            },
            {
                credit: 0,
                questionRef: '9bd9f6da-ce88-4c58-9bff-600f72fc096e',
                sectionRef: 'd0a1dbd7-70f4-4738-ae4e-3998a1390b70',
                response: '2210e912-db46-4d68-933a-627395ab88d1',
            },
        ],
        format: 'SIMULATE',
    },
] as Attempt[];

vi.mock('@renderer/services/attempts-service.ts', () => {
    return {
        AttemptsService: {
            fetchAttemptHistoryForTest: vitest.fn().mockImplementation(() => of(attempts)),
            fetchAttempt: vitest.fn().mockImplementation(() => {
                return {
                    uuid: 'a4a828bf-37b4-48a9-8d7d-81d051d41251 ',
                    testRef: '824739e4-a3f9-42b8-af78-a84b70c3854b',
                    started: new Date(2024, 1, 2, 13, 30), // Feb 2, 2024 @ 1330
                    completed: new Date(2024, 1, 2, 14, 0, 37), // Feb 2, 2024 @ 1400
                    status: 'COMPLETED',
                    score: 0.5,
                    questionResponses: [
                        {
                            credit: 1,
                            questionRef: 'b4983a44-4af3-43cb-9f38-f1a08c6e9c2d',
                            sectionRef: 'd0a1dbd7-70f4-4738-ae4e-3998a1390b70',
                            response: '6a13d8b9-1e67-4d4d-ad0d-b4427fbced30',
                        },
                        {
                            credit: 0,
                            questionRef: '50c274a5-cc12-4fee-9b6d-5fa6ae05ef9f',
                            sectionRef: 'd0a1dbd7-70f4-4738-ae4e-3998a1390b70',
                            response: 'b4ef0dd6-9783-4c69-9467-0e154d58ad5a',
                        },
                        {
                            credit: 1,
                            questionRef: 'c1cc99fd-2ae6-4c55-b97b-403496002f2a',
                            sectionRef: '435ba64b-1f72-4990-817d-1a3ba42f4179',
                            response: '29926c5b-1534-4b0b-be1b-358f26043b97',
                        },
                        {
                            credit: 0,
                            questionRef: '9bd9f6da-ce88-4c58-9bff-600f72fc096e',
                            sectionRef: '435ba64b-1f72-4990-817d-1a3ba42f4179',
                        },
                    ],
                    format: 'SIMULATE',
                } as Attempt;
            }),
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
                            contentRef: '75a4edef-3501-4bac-a7aa-3430d64d1b77', // What is 2+2?
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
                            contentRef: 'ca599c18-1768-4799-aa93-37749eaef6a2', // What is the process by which plants make energy?
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
                            contentRef: 'e58d5524-20a1-4316-a277-9ee31a9d3637', // What is the cycle of waters movement through the ecosystem called?
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
                            contentRef: '3c69eaeb-0cae-46da-8f0e-8d76c0924acc', // Where do babies come from?
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

const mockResources = new Map<string, string>([
    ['75a4edef-3501-4bac-a7aa-3430d64d1b77', 'What is 2+2?'],
    ['ca599c18-1768-4799-aa93-37749eaef6a2', 'What is the process by which plants make energy?'],
    [
        'e58d5524-20a1-4316-a277-9ee31a9d3637',
        'What is the cycle of waters movement through the ecosystem called?',
    ],
    ['3c69eaeb-0cae-46da-8f0e-8d76c0924acc', 'Where do babies come from?'],
]);

vi.mock('@renderer/services/resources-service.ts', () => {
    return {
        ResourcesService: {
            fetchResource: vi.fn().mockImplementation((uuid) => {
                return Promise.resolve({ data: mockResources.get(uuid) });
            }),
        },
    };
});

describe('results for attempt page', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('should display descriptive information and filters', async () => {
        const { getByTestId } = render(ResultsForAttemptVue);

        // Advance timers so async methods are executed and options are rendered
        await vi.runAllTimersAsync();

        // Test Details
        expect(getByTestId('questions-in-attempt')).toHaveTextContent('4 questions');
        expect(getByTestId('hours-allowed')).toHaveTextContent('1.0 hours');
        expect(getByTestId('passing-percentage')).toHaveTextContent('75% to pass');

        // Attempt Details
        expect(getByTestId('score-percentage')).toHaveTextContent('50%');
        expect(getByTestId('score-percentage')).toHaveClass('has-text-danger');
        expect(getByTestId('attempt-date')).toHaveTextContent('February 2nd, 2:00 PM');
        expect(getByTestId('attempt-duration')).toHaveTextContent('30 minutes, 37 seconds');

        // Questions Details
        expect(getByTestId('filtered-questions-length')).toHaveTextContent(
            'Showing 4 of 4 responses',
        );

        // Section Filter Options are Available
        const availableSectionOptions = Array.from(
            (getByTestId('section-filter') as HTMLSelectElement).options,
        ).map((o) => o.textContent);
        expect(availableSectionOptions).toHaveLength(3);
        expect(availableSectionOptions).toEqual(
            expect.arrayContaining(['All Sections', 'Section 1', 'Section 2']),
        );

        // Category Filter Options are Available
        const availableCategoryOptions = Array.from(
            (getByTestId('category-filter') as HTMLSelectElement).options,
        ).map((o) => o.textContent);
        expect(availableCategoryOptions).toHaveLength(7);
        expect(availableCategoryOptions).toEqual(
            expect.arrayContaining([
                'All Categories',
                'addition',
                'biology',
                'math',
                'plant life',
                'reproduction',
                'water cycle',
            ]),
        );

        // Correctnss Filter Options are Available
        const correctnessOptions = Array.from(
            (getByTestId('correctness-filter') as HTMLSelectElement).options,
        ).map((o) => o.textContent);
        expect(correctnessOptions).toHaveLength(4);
        expect(correctnessOptions).toEqual(
            expect.arrayContaining(['All Questions', 'Correct', 'Incorrect', 'Skipped']),
        );
    });

    it('should filter by section', async () => {
        const { getByTestId } = render(ResultsForAttemptVue);

        // Advance timers so async methods are executed and options are rendered
        await vi.runAllTimersAsync();

        // Filter on Section 2
        fireEvent.update(getByTestId('section-filter'), '435ba64b-1f72-4990-817d-1a3ba42f4179');

        // Advance timers so filters are applied and DOM is updated
        await vi.runAllTimersAsync();

        // Confirm pagination updated
        expect(getByTestId('filtered-questions-length')).toHaveTextContent(
            'Showing 2 of 4 responses',
        );

        // Confirm only Section 2 Questions are shown
        const responseSection = getByTestId('response-section');
        expect(responseSection).not.toHaveTextContent(/.*What is 2+2?.*/);
        expect(responseSection).not.toHaveTextContent(
            /.*What is the process by which plants make energy?.*/,
        );
        expect(responseSection).toHaveTextContent(
            /.*What is the cycle of waters movement through the ecosystem called?.*/,
        );
        expect(responseSection).toHaveTextContent(/.*Where do babies come from?.*/);
    });

    it('should filter by category', async () => {
        const { getByTestId } = render(ResultsForAttemptVue);

        // Advance timers so async methods are executed and options are rendered
        await vi.runAllTimersAsync();

        // Filter on 'math' category
        fireEvent.update(getByTestId('category-filter'), 'math');

        // Advance timers so filters are applied and DOM is updated
        await vi.runAllTimersAsync();

        // Confirm pagination updated
        expect(getByTestId('filtered-questions-length')).toHaveTextContent(
            'Showing 1 of 4 responses',
        );

        // Confirm only Section 2 Questions are shown
        const responseSection = getByTestId('response-section');
        expect(responseSection).toHaveTextContent(/.*What is 2+2?.*/);
        expect(responseSection).not.toHaveTextContent(
            /.*What is the process by which plants make energy?.*/,
        );
        expect(responseSection).not.toHaveTextContent(
            /.*What is the cycle of waters movement through the ecosystem called?.*/,
        );
        expect(responseSection).not.toHaveTextContent(/.*Where do babies come from?.*/);
    });

    it('should filter by response status', async () => {
        const { getByTestId } = render(ResultsForAttemptVue);

        // Advance timers so async methods are executed and options are rendered
        await vi.runAllTimersAsync();

        //////////////
        // CORRECT
        //////////////
        fireEvent.update(getByTestId('correctness-filter'), 'Correct');

        // Advance timers so filters are applied and DOM is updated
        await vi.runAllTimersAsync();

        // Confirm pagination updated
        expect(getByTestId('filtered-questions-length')).toHaveTextContent(
            'Showing 2 of 4 responses',
        );

        // Confirm only Correct responses are shown
        const responseSection = getByTestId('response-section');
        expect(responseSection).toHaveTextContent(/.*What is 2+2?.*/);
        expect(responseSection).not.toHaveTextContent(
            /.*What is the process by which plants make energy?.*/,
        );
        expect(responseSection).toHaveTextContent(
            /.*What is the cycle of waters movement through the ecosystem called?.*/,
        );
        expect(responseSection).not.toHaveTextContent(/.*Where do babies come from?.*/);

        //////////////
        // INCORRECT
        //////////////
        fireEvent.update(getByTestId('correctness-filter'), 'Incorrect');

        // Advance timers so filters are applied and DOM is updated
        await vi.runAllTimersAsync();

        // Confirm pagination updated
        expect(getByTestId('filtered-questions-length')).toHaveTextContent(
            'Showing 1 of 4 responses',
        );

        // Confirm only Correct responses are shown
        expect(responseSection).not.toHaveTextContent(/.*What is 2+2?.*/);
        expect(responseSection).toHaveTextContent(
            /.*What is the process by which plants make energy?.*/,
        );
        expect(responseSection).not.toHaveTextContent(
            /.*What is the cycle of waters movement through the ecosystem called?.*/,
        );
        expect(responseSection).not.toHaveTextContent(/.*Where do babies come from?.*/);
    });
});
