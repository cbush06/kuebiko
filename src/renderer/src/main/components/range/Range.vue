<template>
    <div class="field is-grouped">
        <div class="control is-expanded">
            <input
                type="range"
                :data-testid="`${props.id}-input`"
                class="is-fullwidth w-100"
                :min="props.min"
                :max="props.max"
                v-model.number="model"
                list="max-questions-ticks"
                :disabled="disabled"
            />
            <datalist
                v-if="props.ticks"
                :data-testid="`${props.id}-datalist`"
                class="is-flex is-justify-content-space-between w-100"
            >
                <option v-for="n in props.ticks" :key="n" :value="n" :label="props.ticks[n] ?? n" />
            </datalist>
        </div>
        <div v-if="props.showValueAtEnd" class="control">
            <span
                :data-testid="`${props.id}-value`"
                class="input text-center is-inline-block"
                style="field-sizing: content; min-width: 3rem"
                >{{ model }}</span
            >
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';

export interface RangeProps {
    id?: string;
    ticks?: Array<string> | number;
    min: number;
    max: number;
    showValueAtEnd?: boolean;
    disabled?: boolean;
}

const props = withDefaults(defineProps<RangeProps>(), {
    showValueAtEnd: false,
    disabled: false,
});
const model = defineModel<number>({
    required: true
});

const disabled = ref<boolean>(props.disabled);
const progress = computed(() => {
    if (disabled.value || props.max <= props.min) {
        return '0%';
    }
    return ((model.value - props.min) / (props.max - props.min)) * 100 + '%';
});
const rangeTopMargin = computed(() => (props.showValueAtEnd ? '1rem' : '0'));

onMounted(() => {
    validateProps();
});

const validateProps = (): void => {
    if (props.max <= props.min) {
        console.warn("'max' must be greater than 'min'");
        disabled.value = true;
    }
    if (props.ticks) {
        if (typeof props.ticks == 'number' && props.ticks !== props.max - props.min + 1) {
            console.warn(
                "If <Range /> component prop 'ticks' is a number, it must be equal to the number of possible values.",
            );
        }

        if (Array.isArray(props.ticks) && props.ticks.length !== props.max - props.min + 1) {
            console.warn(
                "If <Range /> component prop 'ticks' is an array, it must have length equal to the number of possible values.",
            );
        }
    }
};
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
