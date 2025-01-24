<template>
    <nav
        class="navbar is-flex is-flex-direction-row is-justify-content-space-between is-info is-fixed-top"
    >
        <div class="navbar-brand">
            <div class="navbar-item">
                <img src="../../assets/kuebiko_white.png" />
                <span class="is-size-4 has-text-weight-light ml-3">Kuebiko</span>
            </div>
        </div>
        <div class="navbar-item is-flex-grow-1 is-justify-content-center">
            <span class="title has-text-white">{{ title }}</span>
        </div>
        <div class="navbar-end mr-2">
            <!-- <div v-if="test?.allowedTime" class="level has-text-white"> -->
            <div class="level has-text-white">
                <i class="fa-solid fa-clock"></i>
                <span class="timer is-size-5 ml-2 has-text-weight-semibold">
                    <TimerVue
                        :duration="timerValue"
                        :ticking="ticking"
                        @expired="emit('outOfTime')"
                    />
                </span>
            </div>
        </div>
    </nav>
</template>

<script setup lang="ts">
import TimerVue from '@renderer/components/timer/Timer.vue';

const emit = defineEmits<{
    (event: 'outOfTime'): void;
}>();

const { title, timerValue, ticking } = defineProps<{
    title: string;
    timerValue: number;
    ticking: boolean;
}>();
</script>

<style scoped></style>
