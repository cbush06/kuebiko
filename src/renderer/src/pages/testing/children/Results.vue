<template>
    <div class="section content">
        <h1 class="title mb-1">{{ t('testResults') }}</h1>
        <div class="columns is-size-4 p-2" style="border-bottom: 1px solid #000">
            <div class="column is-one-third">
                <i class="fa-solid fa-question"></i>
                {{ testDeliveryStore.totalQuestions }}
                {{ t('questions', [testDeliveryStore.totalQuestions]) }}
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
                <div class="column is-half"></div>
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
    </div>
</template>

<script setup lang="ts">
import { useTestDeliveryStore } from '@renderer/store/test-delivery-store/test-delivery-store';
import moment from 'moment';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const testDeliveryStore = useTestDeliveryStore();
const { t } = useI18n({ inheritLocale: true, useScope: 'local', fallbackRoot: true });

const gradeColorClass = computed(() => {
    if ((testDeliveryStore.attempt?.score ?? 0) < (testDeliveryStore.test?.passingPercentage ?? 0.75)) {
        return 'has-text-danger';
    }
    return 'has-text-success';
});

const completionDate = computed(() => moment(testDeliveryStore.attempt?.completed).format('MMMM Do, h:mm A'));
const duration = computed(() => {
    const d = moment.duration(moment(testDeliveryStore.attempt?.completed).diff(testDeliveryStore.attempt?.score));
    if (d.hours()) {
        return `${d.hours()} hours, ${d.minutes()} minutes`;
    }
    return `${d.minutes()} minutes, ${d.seconds()} seconds`;
});
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
