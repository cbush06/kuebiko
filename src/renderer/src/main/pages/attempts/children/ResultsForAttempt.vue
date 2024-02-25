<template>
    <div class="section">
        <h1 class="title mb-1">{{ test?.title }}</h1>
        <div class="columns is-size-4 p-2" style="border-bottom: 1px solid #000">
            <div class="column is-one-third">
                <i class="fa-solid fa-question"></i>
                {{ t('totalQuestions', [totalQuestions]) }}
            </div>
            <div class="column is-one-third">
                <div v-if="test?.allowedTime">
                    <i class="fa-solid fa-clock mr-2"></i>
                    {{ t('hoursAllowed', [allowedTime]) }}
                </div>
            </div>
            <div class="column is-one-third">
                <i class="fa-solid fa-award mr-2"></i>
                {{ t('passingPercentage', [passingPercentage]) }}
            </div>
        </div>
        <div class="box">
            <div class="columns is-vcentered">
                <div class="column is-half" style="height: 40vh">
                    <Doughnut :data="overallResultsPieChartData" :options="overallResultsPieChartOptions" />
                </div>
                <div class="column is-half text-center">
                    <div class="select">
                        <select :value="attempt?.uuid" @change="handleAttemptSelectionChange(($event.target as HTMLSelectElement).value)">
                            <option v-for="a in attempts" :value="a.uuid">
                                {{ format(a.completed!, 'MMM dd, yyyy h:mm aa') }}
                            </option>
                        </select>
                    </div>
                    <div :class="`is-size-1 has-text-weight-semibold ${gradeColorClass}`">{{ Math.round((attempt?.score ?? 0) * 100) }}%</div>
                    <div class="is-size-4">
                        {{ completionDate }}
                    </div>
                    <div class="is-size-4">
                        {{ duration }}
                    </div>
                </div>
            </div>
        </div>
        <div class="box section-breakdown-box">
            <div class="block chart-container" v-for="s in sectionScoringBreakdown">
                <h2 class="is-size-5 has-text-weight-semibold">{{ s.section ? s.section : t('default') }}</h2>
                <Bar :data="sectionScoringBreakdownChartData(s)" :options="sectionScoringBreakdownChartOptions" />
            </div>
            <div class="level chart-legend-container">
                <div class="chart-legend-entry">
                    <div class="legend-color correct"></div>
                    <div class="legend-label">{{ t('correct') }}</div>
                </div>
                <div class="chart-legend-entry">
                    <div class="legend-color incorrect"></div>
                    <div class="legend-label">{{ t('incorrect') }}</div>
                </div>
                <div class="chart-legend-entry">
                    <div class="legend-color skipped"></div>
                    <div class="legend-label">{{ t('skipped') }}</div>
                </div>
            </div>
        </div>
        <div class="box">
            <div class="level mb-4">
                <div class="level-left">
                    <div class="level-item">Showing 75 of 75 responses</div>
                </div>
                <div class="level-right">
                    <div class="level-item select">
                        <select>
                            <option selected disabled>All Sections</option>
                        </select>
                    </div>
                    <div class="level-item select">
                        <select>
                            <option selected disabled>All Categories</option>
                        </select>
                    </div>
                    <div class="level-item select">
                        <select>
                            <option selected disabled>All Questions</option>
                        </select>
                    </div>
                </div>
            </div>
            <div class="level is-full-box-width is-grey-light-border has-bottom-border-1" style="height: 1px"></div>
            <div v-for="(r, i) in attempt?.questionResponses" class="is-full-box-width mb-4" :class="{ 'has-background-white-ter': i % 2 > 0 }">
                <ResponseVue :key="`${attempt?.uuid}-${r.questionRef}`" :question="questionMap?.get(r.questionRef)" :questionNumber="i + 1" :response="r" />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { KuebikoDb } from '@renderer/db/kuebiko-db';
import { Attempt } from '@renderer/db/models/attempt';
import { Question } from '@renderer/db/models/question';
import { QuestionResponse } from '@renderer/db/models/question-response';
import { Test } from '@renderer/db/models/test';
import { AttemptsService } from '@renderer/services/attempts-service';
import { useHelmetStore } from '@renderer/store/helmet-store/helmet-store';
import { millisToHours } from '@renderer/utils/datetime-utils';
import { useMemoize } from '@vueuse/core';
import { useObservable } from '@vueuse/rxjs';
import {
    ArcElement,
    BarController,
    BarElement,
    CategoryScale,
    ChartData,
    Chart as ChartJS,
    ChartOptions,
    DoughnutDataPoint,
    Legend,
    LinearScale,
    PieController,
    Tooltip,
} from 'chart.js';
import { DistributiveArray } from 'chart.js/dist/types/utils';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { differenceInHours, differenceInMinutes, differenceInSeconds, format } from 'date-fns';
import { computed, ref, watch } from 'vue';
import { Bar, Doughnut } from 'vue-chartjs';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import ResponseVue from './Response.vue';

const { t } = useI18n();
const router = useRouter();
const route = useRoute();
const helmetStore = useHelmetStore();
const test = ref<Test>();
const attempt = ref<Attempt>();
const questionMap = ref<Map<string, Question>>();

watch(
    () => route.params,
    async () => {
        test.value = await KuebikoDb.INSTANCE.tests
            .where('uuid')
            .equals(route.params['testUuid'] as string)
            .first();

        attempt.value = await KuebikoDb.INSTANCE.attempts
            .where('uuid')
            .equals(route.params['attemptUuid'] as string)
            .first();

        const questionRefs = test.value?.sections.flatMap((s) => s.questionRefs) ?? [];
        questionMap.value = (await KuebikoDb.INSTANCE.questions.where('uuid').anyOf(questionRefs).toArray()).reduce(
            (m, q) => m.set(q.uuid, q),
            new Map<string, Question>(),
        );
        helmetStore.title = `Kuebiko :: ${t('resultsForTest', [test.value?.title, format(attempt.value?.completed!, 'MMM dd, yyyy h:mm aa')])}`;
    },
    { immediate: true },
);

const totalQuestions = computed(() => test.value?.sections.reduce((cnt, s) => cnt + s.questionRefs.length, 0));
const allowedTime = computed(() =>
    millisToHours(test.value?.allowedTime ?? 0)
        .toFixed(1)
        .toString()
        .padStart(1, '0'),
);
const passingPercentage = computed(() => test.value?.passingPercentage ?? 75);
const completionDate = computed(() => (attempt.value?.completed ? format(attempt.value?.completed, 'MMMM do, h:mm aa') : ''));
const attempts = useObservable(AttemptsService.fetchAttemptHistoryForTest(route.params['testUuid'] as string));

const handleAttemptSelectionChange = (uuid: string) => {
    const a = attempts.value!.filter((n) => n.uuid === uuid)[0];
    router.push(`/attempts/${a.testRef}/${a.uuid}`);
};

const duration = computed(() => {
    if (!attempt.value?.completed) return 0;
    const hours = differenceInHours(attempt.value?.completed!, attempt.value?.started!);
    const minutes = differenceInMinutes(attempt.value?.completed!, attempt.value?.started!);
    const seconds = differenceInSeconds(attempt.value?.completed!, attempt.value?.started!);
    if (hours) {
        return `${hours} ${t('hours')}, ${minutes} ${t('minutes')}, ${seconds} ${t('seconds')}`;
    }
    return `${minutes} ${t('minutes')}, ${seconds} ${t('seconds')}`;
});

const overallScoringBreakdown = computed(() => ({
    correct: attempt.value?.questionResponses.filter((r) => r.credit === 1).length,
    incorrect: attempt.value?.questionResponses.filter((r) => !!r.response && r.credit < 1).length,
    skipped: attempt.value?.questionResponses.filter((r) => !r.response && r.credit === 0).length,
}));

const gradeColorClass = computed(() => {
    if ((attempt.value?.score ?? 0) < (test.value?.passingPercentage ?? 0.75)) {
        return 'has-text-danger';
    }
    return 'has-text-success';
});

ChartJS.register(PieController, ArcElement, Tooltip, Legend, ChartDataLabels, BarController, BarElement, CategoryScale, LinearScale);
const overallResultsPieChartOptions = computed(
    () =>
        ({
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                },
                datalabels: {
                    color: '#000',
                    font: {
                        weight: 'bold',
                        size: 18,
                    },
                },
            },
        }) as ChartOptions<'doughnut'>,
);
const overallResultsPieChartData = computed(
    () =>
        ({
            labels: [t('correct'), t('incorrect'), t('skipped')],
            datasets: [
                {
                    data: [overallScoringBreakdown.value.correct, overallScoringBreakdown.value.incorrect, overallScoringBreakdown.value.skipped],
                    datalabels: {
                        anchor: 'center',
                        backgroundColor: null,
                        borderWidth: 0,
                        display: function (ctx: any) {
                            return ctx.dataset.data[ctx.dataIndex] > 0 ? ctx.dataset.data[ctx.dataIndex] : '';
                        },
                    },
                    backgroundColor: ['#84E0A3', '#FFAFA3', '#E6E6E6'],
                },
            ],
        }) as ChartData<'doughnut', DistributiveArray<DoughnutDataPoint>>,
);

interface SectionScoringBreakdown {
    uuid: string;
    section: string;
    correct: number;
    incorrect: number;
    skipped: number;
}

const sectionScoringBreakdown = computed(() =>
    Array.from(
        (attempt.value?.questionResponses ?? [])
            // 1. group responses by section
            .reduce((map, next) => {
                if (!map.has(next.sectionRef)) map.set(next.sectionRef, []);
                map.get(next.sectionRef)?.push(next);
                return map;
            }, new Map<string, QuestionResponse[]>())
            // 2. rollup each section into a usable object
            .entries(),
    ).map(
        (sectionGrouping) =>
            ({
                uuid: sectionGrouping[0],
                section: test.value?.sections?.filter((s) => s.uuid === sectionGrouping[0])[0].title,
                correct: sectionGrouping[1].filter((r) => r.credit === 1).length,
                incorrect: sectionGrouping[1].filter((r) => !!r.response && r.credit < 1).length,
                skipped: sectionGrouping[1].filter((r) => !r.response && r.credit === 0).length,
            }) as SectionScoringBreakdown,
    ),
);
const sectionScoringBreakdownChartOptions = computed(
    () =>
        ({
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    stacked: true,
                    grid: {
                        display: false,
                    },
                    border: {
                        display: false,
                    },
                    ticks: {
                        display: false,
                    },
                },
                y: {
                    stacked: true,
                    grid: {
                        display: false,
                    },
                    border: {
                        display: false,
                    },
                    ticks: {
                        display: false,
                    },
                },
            },
            plugins: {
                datalabels: {
                    font: {
                        weight: 'bold',
                        size: 18,
                    },
                    display: (context) => context.dataset.data[context.dataIndex] ?? 0 > 0,
                },
                legend: {
                    display: false,
                },
            },
        }) as ChartOptions<'bar'>,
);

const sectionScoringBreakdownChartData = useMemoize(
    (section: SectionScoringBreakdown) =>
        ({
            labels: [section.section],
            datasets: [
                {
                    label: t('correct'),
                    data: [section.correct],
                    backgroundColor: '#84E0A3',
                },
                {
                    label: t('incorrect'),
                    data: [section.incorrect],
                    backgroundColor: '#FFAFA3',
                },
                {
                    label: t('skipped'),
                    data: [section.skipped],
                    backgroundColor: '#E6E6E6',
                },
            ],
        }) as ChartData<'bar', DistributiveArray<DoughnutDataPoint>>,
);
</script>

<style scoped lang="scss">
@import '~/bulma/bulma.sass';

.section-breakdown-box {
    .chart-container {
        height: 3rem;
        margin-bottom: 2rem;

        &:last-child {
            margin-bottom: 0;
        }
    }

    .chart-legend-container {
        @extend .is-flex, .is-align-items-center, .is-flex-direction-row, .is-justify-content-space-evenly;

        .chart-legend-entry {
            @extend .is-flex, .is-flex-direction-row, .is-align-items-center;
            gap: 0.2rem;

            .legend-label {
                @extend .is-flex, .is-flex-direction-row, .is-align-items-center;
            }
            .legend-color {
                @extend .is-flex, .is-flex-direction-row, .is-align-items-center;

                height: 10px;
                width: 40px;

                &.correct {
                    background-color: #84e0a3;
                }
                &.incorrect {
                    background-color: #ffafa3;
                }
                &.skipped {
                    background-color: #e6e6e6;
                }
            }
        }
    }
}
</style>

<i18n lang="json">
{
    "en": {
        "resultsForTest": "@:results :: {0} :: {1}",
        "totalQuestions": "{0} @:questions",
        "hoursAllowed": "{0} @:hours",
        "passingPercentage": "{0}% to @:pass"
    }
}
</i18n>
@renderer/db/kuebiko-db@renderer/db/models/attempt@renderer/db/models/question@renderer/db/models/question-response@renderer/db/models/test@renderer/services/attempts-service@renderer/store/helmet-store/helmet-store@renderer/utils/datetime-utils
