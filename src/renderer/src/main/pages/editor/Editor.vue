<template>
    <NavVue />
    <div class="editor container is-max-widescreen mt-4">
        <router-view />
    </div>
</template>

<script setup lang="ts">
import NavVue from '@renderer/components/nav/Nav.vue';
import { useHelmetStore } from '@renderer/store/helmet-store/helmet-store';
import { onBeforeMount } from 'vue';
import { useI18n } from 'vue-i18n';

const helmetStore = useHelmetStore();
const { t } = useI18n({ inheritLocale: true, useScope: 'local', fallbackRoot: true });

onBeforeMount(() => (helmetStore.title = t('homeTitle')));
</script>

<style scoped lang="scss">
@import '@renderer/scss/bulma-customizations.scss';
@import '~/bulma/bulma.sass';

.editor {
    // Negate .has-navbar-fixed-bottom
    height: calc(100% + $navbar-height - 1em) !important;
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
