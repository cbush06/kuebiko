<template>
    <NavVue />
    <div class="container is-max-widescreen mt-4">
        <router-view></router-view>
    </div>
</template>

<script setup lang="ts">
import NavVue from '@renderer/components/Nav.vue';
</script>

<style scoped lang="scss"></style>
