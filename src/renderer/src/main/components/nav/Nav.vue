<script setup lang="ts"></script>

<template>
    <nav class="navbar is-primary is-fixed-top" role="navigation" aria-label="main navigation">
        <div class="navbar-brand">
            <div class="navbar-item">
                <img src="../../assets/kuebiko_white.png" />
                <span class="is-size-4 has-text-weight-semibold ml-3">Kuebiko</span>
            </div>
        </div>

        <div class="navbar-menu">
            <div class="navbar-start">
                <router-link to="/" class="navbar-item" active-class="is-active">Tests</router-link>
                <router-link to="/attempts" class="navbar-item" active-class="is-active">
                    Attempts
                </router-link>
                <router-link to="/editor" class="navbar-item" active-class="is-active">
                    Editor
                </router-link>
            </div>

            <div class="navbar-end">
                <!-- <div class="navbar-item">
                    <div class="buttons">
                        <a class="button is-light">Log in</a>
                    </div>
                </div> -->
            </div>
        </div>
    </nav>
</template>

<style scoped lang="scss"></style>
