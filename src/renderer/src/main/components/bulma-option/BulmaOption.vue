<template>
    <div class="bulma-option" v-bind="$attrs">
        <label v-if="multiple" class="bulma-option-check" :class="inheritedOptionClass">
            <i
                class="fa-solid"
                :class="{
                    'fa-square-check': isSelected,
                    'fa-square': !isSelected,
                    [inheritedIconClass]: !!inheritedIconClass,
                }"
            ></i>
            <span class="bulma-option-content"><slot /></span>
            <input type="checkbox" :name="name" :value="value" v-model="modelValue" />
        </label>
        <label v-else class="bulma-option-radio" :class="inheritedOptionClass">
            <i
                class="fa-solid"
                :class="{
                    'fa-circle-dot': isSelected,
                    'fa-circle': !isSelected,
                    [inheritedIconClass]: !!inheritedIconClass,
                }"
            ></i>
            <span class="bulma-option-content"><slot /></span>
            <input type="radio" :name="name" :value="value" v-model="modelValue" />
        </label>
    </div>
</template>

<script setup lang="ts">
import { computed, getCurrentInstance, Ref, ref, useAttrs } from 'vue';

const multiple = ref(false);
const name = ref<string>();
const inheritedOptionClass = ref<string>('');
const inheritedIconClass = ref<string>('');

const { optionClass, iconClass, value } = defineProps<{
    optionClass?: string;
    iconClass?: string;
    value?: any;
}>();

// Get parent instance
const parent = getCurrentInstance()!.parent;
const modelValue = parent!.exposed!.modelValue as Ref<Array<any> | any>;
name.value = parent!.props.name as string;
multiple.value = parent!.props.multiple as boolean;
inheritedOptionClass.value = (optionClass ?? '') + ' ' + (parent!.props.optionClass ?? '');
inheritedIconClass.value = (iconClass ?? '') + ' ' + (parent!.props.iconClass ?? '');

// Is this option selected?
const isSelected = computed(() => {
    if (multiple.value) {
        return modelValue.value.includes(value);
    }
    return modelValue.value === value;
});
</script>

<style lang="scss" scoped>
@use '@renderer/style';

.bulma-option {
    @extend .control;

    label {
        @extend .is-flex, .is-flex-direction-row, .is-align-items-center, .is-vcentered;

        width: fit-content;
        gap: 0.5em;

        input {
            display: none;
        }

        &.bulma-option-check {
            @extend .checkbox;
        }

        &.bulma-option-radio {
            @extend .radio;
        }
    }
}
</style>
