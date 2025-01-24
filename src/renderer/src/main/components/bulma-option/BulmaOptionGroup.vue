<template>
    <fieldset v-bind="$attrs">
        <slot />
    </fieldset>
</template>

<script setup lang="ts">
const {
    orientation = 'column',
    multiple, // eslint-disable-line @typescript-eslint/no-unused-vars
    name, // eslint-disable-line @typescript-eslint/no-unused-vars
} = defineProps<{
    orientation: 'column' | 'row';
    name: string;
    multiple?: boolean;
    optionClass?: string;
    iconClass?: string;
}>();

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const modelValue = defineModel<Array<any> | any>({ default: [] });

// Register BulmaOption children
defineExpose({
    modelValue,
});
</script>

<style scoped>
fieldset {
    border: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: v-bind(orientation);
    gap: 0.5rem;
}
</style>
