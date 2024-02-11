<template>
    {{ formattedRemaining }}
</template>

<script setup lang="ts">
import { hoursToMilliseconds, millisecondsToHours, millisecondsToMinutes, millisecondsToSeconds, minutesToMilliseconds } from 'date-fns';
import { watch } from 'vue';
import { computed, ref } from 'vue';

export interface TimerProps {
    duration: number;
    ticking?: boolean;
}

const props = defineProps<TimerProps>();
const emit = defineEmits(['expired']);

const remaining = ref<number>(props.duration);
const timer = ref<number>();

const remainingDuration = computed(() => {
    const hours = millisecondsToHours(remaining.value);
    const minutes = millisecondsToMinutes(remaining.value - hoursToMilliseconds(hours));
    const seconds = millisecondsToSeconds(remaining.value - hoursToMilliseconds(hours) - minutesToMilliseconds(minutes));
    return {
        hours,
        minutes,
        seconds,
    };
});

const formattedRemaining = computed(() => {
    const d = remainingDuration.value;
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
        if (isTicking && remaining.value > 0) {
            timer.value = window.setInterval(() => {
                remaining.value -= 1000;
                if (remaining.value <= 0) {
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
