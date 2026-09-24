<template>
    <div class="field is-grouped">
        <div class="control is-expanded">
            <input
                :data-testid="props.id"
                type="range"
                class="is-fullwidth w-100"
                :min="props.min"
                :max="props.max"
                v-model="model"
                list="max-questions-ticks"
            />
            <datalist
                id="max-questions-ticks"
                class="is-flex is-justify-content-space-between w-100"
            >
                <option
                    v-for="n in props.ticks"
                    v-bind:key="n"
                    :value="n"
                    :label="props.ticks[n] ?? n"
                />
            </datalist>
        </div>
        <div v-if="props.showValueAtEnd" class="control">
            <span
                class="input text-center is-inline-block"
                style="field-sizing: content; min-width: 3rem"
                >{{ model }}</span
            >
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

export interface RangeProps {
    id?: string;
    ticks: Record<number, string> | number;
    min: number;
    max: number;
    showValueAtEnd?: boolean;
}

const props = defineProps<RangeProps>();
const model = defineModel<number>({ default: 0 });

const progress = computed(() => (((model.value - props.min) / (props.max - props.min)) * 100) + '%');
const rangeTopMargin = computed(() => (props.showValueAtEnd ? '0.5rem' : '0'));
</script>

<style scoped lang="scss">
@use '@renderer/style';

input[type='range'] {
    margin-top: v-bind(rangeTopMargin);

    -webkit-appearance: none;
    appearance: none;

    &::-webkit-slider-runnable-track {
        -webkit-appearance: none;
        appearance: none;

        background:
            linear-gradient(var(--bulma-primary), var(--bulma-primary)) 0 / v-bind(progress) 100%
                no-repeat,
            #efefef;

        height: 10px;
        border-radius: 5px;
    }

    &::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;

        background-color: var(--bulma-primary);
        cursor: pointer;

        border-radius: 50%;
        transform: translateY(-5px);

        width: 20px;
        height: 20px;

        filter: drop-shadow(2px 2px 2px rgba(0, 0, 0, 0.25));
    }
}
</style>
