<template>
    <div class="section content">
        <h1 class="title mb-1">{{ t('testResults') }}</h1>
        <div class="columns is-size-4 p-2" style="border-bottom: 1px solid #000">
            <div class="column is-one-third">
                <i class="fa-solid fa-question"></i>
                {{ t('totalQuestions', [testDeliveryStore.totalQuestions]) }}
            </div>
            <div class="column is-one-third">
                <div v-if="testDeliveryStore.test?.allowedTime">
                    <i class="fa-solid fa-clock mr-2"></i>
                    {{ t('hours', [testDeliveryStore.test.allowedTime]) }}
                </div>
            </div>
            <div class="column is-one-third">
                <i class="fa-solid fa-award mr-2"></i>
                {{ t('passingPercentage', [testDeliveryStore.test?.passingPercentage ?? 75]) }}
            </div>
        </div>
        <div class="box">
            <div class="columns is-vcentered">
                <div class="column is-half">
                    <Doughnut :data="chartData" :options="chartOptions" />
                </div>
                <div class="column is-half text-center">
                    <div :class="`is-size-1 has-text-weight-semibold ${gradeColorClass}`">{{ Math.round((testDeliveryStore.attempt?.score ?? 0) * 100) }}%</div>
                    <div class="is-size-4">
                        {{ completionDate }}
                    </div>
                    <div class="is-size-4">
                        {{ duration }}
                    </div>
                </div>
            </div>
        </div>
        <div class="block is-flex is-flex-direction-row is-justify-content-center is-align-items-center">
            <button class="button is-info">
                <i class="fa-solid fa-chart-column mr-2"></i>
                Review Questions
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useTestDeliveryStore } from '@renderer/store/test-delivery-store/test-delivery-store';
import { differenceInMinutes, differenceInSeconds, format } from 'date-fns';
import { differenceInHours } from 'date-fns/differenceInHours';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { Doughnut } from 'vue-chartjs';

// see https://www.chartjs.org/docs/latest/getting-started/integration.html
import { Chart as ChartJS, PieController, ArcElement, Tooltip, Legend, ChartData, ChartOptions, DoughnutDataPoint } from 'chart.js';
import { DistributiveArray } from 'chart.js/dist/types/utils';

// see https://chartjs-plugin-datalabels.netlify.app/
import ChartDataLabels from 'chartjs-plugin-datalabels';

const testDeliveryStore = useTestDeliveryStore();
const { t } = useI18n({ inheritLocale: true, useScope: 'local', fallbackRoot: true });

const gradeColorClass = computed(() => {
    if ((testDeliveryStore.attempt?.score ?? 0) < (testDeliveryStore.test?.passingPercentage ?? 0.75)) {
        return 'has-text-danger';
    }
    return 'has-text-success';
});

const completionDate = computed(() => (testDeliveryStore.attempt?.completed ? format(testDeliveryStore.attempt?.completed, 'MMMM do, h:mm aa') : ''));
const duration = computed(() => {
    if (!testDeliveryStore.attempt?.completed) return 0;
    const hours = differenceInHours(testDeliveryStore.attempt.completed, testDeliveryStore.attempt.started!);
    const minutes = differenceInMinutes(testDeliveryStore.attempt.completed, testDeliveryStore.attempt.started!);
    const seconds = differenceInSeconds(testDeliveryStore.attempt.completed, testDeliveryStore.attempt.started!);
    if (hours) {
        return `${hours} hours, ${minutes} minutes, ${seconds} seconds`;
    }
    return `${minutes} minutes, ${seconds} seconds`;
});
const scoringBreakdown = computed(() => ({
    correct: testDeliveryStore.attempt?.questionResponses.filter((r) => r.credit === 1).length,
    incorrect: testDeliveryStore.attempt?.questionResponses.filter((r) => !!r.response && r.credit < 1).length,
    skipped: testDeliveryStore.attempt?.questionResponses.filter((r) => !r.response && r.credit === 0).length,
}));

ChartJS.register(PieController, ArcElement, Tooltip, Legend, ChartDataLabels);
const chartOptions = computed(
    () =>
        ({
            responsive: true,
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
const chartData = computed(
    () =>
        ({
            labels: ['Correct', 'Incorrect', 'Skipped'],
            datasets: [
                {
                    data: [scoringBreakdown.value.correct, scoringBreakdown.value.incorrect, scoringBreakdown.value.skipped],
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
</script>

<style scoped></style>

<i18n lang="json">
{
    "en": {
        "testResults": "Test Results",
        "totalQuestions": "{0} questions",
        "hours": "{0} hours",
        "passingPercentage": "{0}% to pass"
    }
}
</i18n>
