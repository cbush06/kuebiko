import { RouteRecordSingleView, RouteRecordSingleViewWithChildren } from 'vue-router';
import HomeVue from './pages/home/Home.vue';
import TestList from './pages/home/children/TestList.vue';
import TestVue from './pages/testing/Test.vue';
import IntroVue from './pages/testing/children/Intro.vue';
import SectionVue from './pages/testing/children/Section.vue';
import QuestionVue from './pages/testing/children/Question.vue';
import ResultsVue from './pages/testing/children/Results.vue';

export default [
    {
        path: '/',
        component: HomeVue,
        children: [
            {
                path: '',
                component: TestList,
            },
        ] as RouteRecordSingleView[],
    },
    {
        path: '/test/:testUuid',
        component: TestVue,
        children: [
            {
                path: '',
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
] as RouteRecordSingleViewWithChildren[];
