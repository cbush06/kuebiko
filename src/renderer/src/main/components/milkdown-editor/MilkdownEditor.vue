<template>
    <Milkdown />
    <ImageSelector ref="imageSelector" />
</template>

<script setup lang="ts">
import { menu } from '@milkdown-lab/plugin-menu';
import { Editor, defaultValueCtx, rootCtx } from '@milkdown/core';
import { listener } from '@milkdown/plugin-listener';
import { commonmark } from '@milkdown/preset-commonmark';
import { gfm } from '@milkdown/preset-gfm';
import { Milkdown, useEditor } from '@milkdown/vue';
import { lastValueFrom } from 'rxjs';
import { ref } from 'vue';
import ImageSelector from '../image-selector/ImageSelector.vue';
import { customMenuCommands, menuConfig } from './milkdown-menu/milkdown-menu';
import { kuebiko } from './theme-kuebiko';

const imageSelector = ref<InstanceType<typeof ImageSelector> | null>(null);

useEditor((root) =>
    Editor.make()
        .config(kuebiko)
        .config((ctx) => {
            ctx.set(rootCtx, root);
            ctx.set(defaultValueCtx, '# Test');
        })
        .config(menuConfig)
        .use(commonmark)
        .use(gfm)
        .use(menu)
        .use(listener)
        .use(customMenuCommands(async () => await lastValueFrom(imageSelector.value!.show()))),
);
</script>

<style scoped></style>
