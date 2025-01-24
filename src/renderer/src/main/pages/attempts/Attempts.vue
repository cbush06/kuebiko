<template>
    <Nav />
    <div class="container is-max-widescreen mt-4">
        <router-view></router-view>
    </div>
</template>

<script setup lang="ts">
import Nav from '@renderer/components/nav/StandardNav.vue';
</script>

<style scoped></style>
