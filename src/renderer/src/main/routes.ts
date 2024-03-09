import { RouteRecordSingleView, RouteRecordSingleViewWithChildren } from 'vue-router';
import AttemptsVue from './pages/attempts/Attempts.vue';
import AttemptsForTestVue from './pages/attempts/children/AttemptsForTest.vue';
import AttemptsRollupVue from './pages/attempts/children/AttemptsRollup.vue';
import ResultsForAttemptVue from './pages/attempts/children/ResultsForAttempt.vue';
import EditorVue from './pages/editor/Editor.vue';
import ListEditorTestsVue from './pages/editor/children/ListEditorTests.vue';
import HomeVue from './pages/home/Home.vue';
import TestVue from './pages/testing/Test.vue';
import ConfigureVue from './pages/testing/children/Configure.vue';
import IntroVue from './pages/testing/children/Intro.vue';
import QuestionVue from './pages/testing/children/Question.vue';
import ResultsVue from './pages/testing/children/Results.vue';
import SectionVue from './pages/testing/children/Section.vue';

export default [
    {
        path: '/',
        component: HomeVue,
    },
    {
        path: '/test/:testUuid',
        component: TestVue,
        children: [
            {
                path: '',
                component: ConfigureVue,
            },
            {
                path: 'intro',
                component: IntroVue,
            },
            {
                path: 'section',
                component: SectionVue,
            },
            {
                path: 'question',
                component: QuestionVue,
            },
            {
                path: 'results',
                component: ResultsVue,
            },
        ] as RouteRecordSingleView[],
    },
    {
        path: '/attempts',
        component: AttemptsVue,
        children: [
            {
                path: '',
                component: AttemptsRollupVue,
            },
            {
                path: ':testUuid',
                component: AttemptsForTestVue,
            },
            {
                path: ':testUuid/:attemptUuid',
                component: ResultsForAttemptVue,
            },
        ] as RouteRecordSingleView[],
    },
    {
        path: '/editor',
        component: EditorVue,
        children: [
            {
                path: '',
                component: ListEditorTestsVue,
            },
        ],
    },
] as RouteRecordSingleViewWithChildren[];
