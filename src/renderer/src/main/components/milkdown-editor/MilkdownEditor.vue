<template>
    <div data-milkdown-root ref="milkdownRoot"></div>
    <ImageSelector ref="imageSelector" />
</template>

<script setup lang="ts">
import { menu } from '@milkdown-lab/plugin-menu';
import { defaultValueCtx, Editor, rootCtx } from '@milkdown/core';
import { listener, listenerCtx } from '@milkdown/plugin-listener';
import { commonmark } from '@milkdown/preset-commonmark';
import { gfm } from '@milkdown/preset-gfm';
import { replaceAll } from '@milkdown/utils';
import { lastValueFrom } from 'rxjs';
import { onMounted, ref, watch } from 'vue';
import ImageSelector from '../image-selector/ImageSelector.vue';
import { customMenuCommands, menuConfig } from './milkdown-menu/milkdown-menu';
import { kuebiko } from './theme-kuebiko';

const model = defineModel<string>({ default: '' });
const milkdownRoot = ref<Node | null>(null);
const imageSelector = ref<InstanceType<typeof ImageSelector> | null>(null);
const editor = ref<Editor>();

onMounted(async () => {
    editor.value = await Editor.make()
        .config(kuebiko)
        .config((ctx) => {
            ctx.set(rootCtx, milkdownRoot.value);
            ctx.set(defaultValueCtx, model.value ?? '');

            const listener = ctx.get(listenerCtx);
            listener.markdownUpdated((_, value) => (model.value = value));
        })
        .config(menuConfig)
        .use(commonmark)
        .use(gfm)
        .use(menu)
        .use(listener)
        .use(customMenuCommands(async () => await lastValueFrom(imageSelector.value!.show())))
        .create();
});

// If the model goes from undefined to defined, re-render the component.
// This likely only occurs at first render when the initial model hasn't fully
// loaded.
watch(model, (newValue, oldValue) => {
    if (!oldValue && newValue) {
        editor.value!.action(replaceAll(newValue, true));
    }
});
</script>

<style scoped lang="scss"></style>
