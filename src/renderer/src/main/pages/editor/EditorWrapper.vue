<template>
    <NavVue />
    <div class="editor is-flex is-flex-direction-column h-100">
        <router-view />
    </div>
</template>

<script setup lang="ts">
import NavVue from '@renderer/components/nav/StandardNav.vue';
import { useHelmetStore } from '@renderer/store/helmet-store/helmet-store';
import { onBeforeMount } from 'vue';
import { useI18n } from 'vue-i18n';

const helmetStore = useHelmetStore();
const { t } = useI18n({ inheritLocale: true, useScope: 'local', fallbackRoot: true });

onBeforeMount(() => (helmetStore.title = t('homeTitle')));
</script>

<style scoped lang="scss">
@use '@renderer/style' as *;

.editor {
    // Negate .has-navbar-fixed-bottom
    height: calc(100% + $navbar-height) !important;
}
</style>

<i18n lang="json">
{
    "en": {
        "homeTitle": "Kuebiko :: Home",
        "tests": "Tests"
    }
}
</i18n>
