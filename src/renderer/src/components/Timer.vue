<template>
    {{ formattedRemaining }}
</template>

<script setup lang="ts">
import { hoursToMilliseconds, millisecondsToHours, millisecondsToMinutes, millisecondsToSeconds, minutesToMilliseconds } from 'date-fns';
import { watch } from 'vue';
import { computed, ref } from 'vue';

export interface TimerProps {
    /**
     * Duration to count down from. If set to 0, Timer acts as a stopwatch.
     */
    duration: number;
    ticking?: boolean;
}

const props = defineProps<TimerProps>();
const emit = defineEmits(['expired']);

const elapsed = ref<number>(props.duration);
const timer = ref<number>();

const mode = computed<'TIMER' | 'STOPWATCH'>(() => {
    if (props.duration > 0) return 'TIMER';
    return 'STOPWATCH';
});

const duration = computed(() => {
    const hours = millisecondsToHours(elapsed.value);
    const minutes = millisecondsToMinutes(elapsed.value - hoursToMilliseconds(hours));
    const seconds = millisecondsToSeconds(elapsed.value - hoursToMilliseconds(hours) - minutesToMilliseconds(minutes));
    return {
        hours,
        minutes,
        seconds,
    };
});

const formattedRemaining = computed(() => {
    const d = duration.value;
    return `${d.hours ? d.hours + ':' : ''}${d.minutes.toString().padStart(2, '0')}:${d.seconds.toString().padStart(2, '0')}`;
});

const stopTimer = () => {
    if (timer.value) window.clearInterval(timer.value);
    timer.value = undefined;
};

watch(
    () => props.ticking,
    (isTicking, oldIsTicking) => {
        if (isTicking === oldIsTicking) return;
        if (isTicking && ((mode.value === 'TIMER' && elapsed.value > 0) || mode.value === 'STOPWATCH')) {
            timer.value = window.setInterval(() => {
                if (mode.value === 'TIMER') elapsed.value -= 1000;
                else elapsed.value += 1000;

                if (elapsed.value <= 0) {
                    emit('expired');
                    stopTimer();
                }
            }, 1000);
            return;
        }
        stopTimer();
    },
);
</script>

<style scoped></style>
