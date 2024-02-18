<template>
    <div class="section">
        <h1 class="title">{{ t('configureTest') }}</h1>

        <h2 class="subtitle">{{ t('testDeliveryMode') }}</h2>
        <div class="block ml-5">
            <div class="field">
                <input class="is-checkradio" id="test-delivery-mode-simulate" type="radio" name="test-delivery-mode" value="SIMULATE" />
                <label for="test-delivery-mode-simulate">{{ t('simulate') }}</label>
            </div>
            <div class="field">
                <input class="is-checkradio" id="test-delivery-mode-prepare" type="radio" name="test-delivery-mode" value="PREPARE" />
                <label for="test-delivery-mode-prepare">{{ t('prepare') }}</label>
            </div>
        </div>

        <div class="subtitle">{{ t('questionOrdering') }}</div>
        <div class="block ml-5">
            <div class="field">
                <input class="is-checkradio" id="question-ordering-original" type="radio" name="question-ordering" value="ORIGINAL" />
                <label for="question-ordering-original">{{ t('questionOrderingOriginal') }}</label>
            </div>
            <div class="field">
                <input class="is-checkradio" id="question-ordering-random" type="radio" name="question-ordering" value="RANDOM" />
                <label for="question-ordering-random">{{ t('questionOrderingRandom') }}</label>
            </div>
            <div class="field">
                <input class="is-checkradio" id="question-ordering-random-by-section" type="radio" name="question-ordering" value="RANDOM_BY_SECTION" />
                <label for="question-ordering-random-by-section">{{ t('questionOrderingRandomBySection') }}</label>
            </div>
        </div>

        <div class="subtitle">{{ t('filterQuestions') }}</div>
        <div class="block ml-5">
            <div class="level">
                <div class="level-left">
                    <label class="level-item">By Section</label>
                    <Multiselect
                        class="level-item is-block"
                        style="min-width: 30rem"
                        v-model="filterBySection"
                        :options="sectionOptions"
                        :multiple="true"
                        :close-on-select="false"
                        :clear-on-select="false"
                    />
                </div>
            </div>
            <div class="level">
                <div class="level-left">
                    <label class="level-item">By Category</label>
                    <Multiselect
                        class="level-item is-block"
                        style="min-width: 30rem"
                        v-model="filterByCategory"
                        :options="categoryOptions"
                        :multiple="true"
                        :close-on-select="false"
                        :clear-on-select="false"
                    />
                </div>
            </div>
        </div>

        <div class="subtitle">{{ t('maximumQuestions') }}</div>
        <div class="block ml-5"></div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { Multiselect } from 'vue-multiselect';

const { t } = useI18n();

const sectionOptions = ref<string[]>(['Social Engineering', 'Networking']);
const filterBySection = ref<string[]>([]);

const categoryOptions = ref<string[]>(['Man-in-the-Middle', 'DDOS', 'Data-at-Rest']);
const filterByCategory = ref<string[]>([]);
</script>

<style scoped></style>

<i18n lang="json">
{
    "en": {
        "configureTest": "Configure Your Test",
        "filterQuestions": "Filter Questions",
        "maximumQuestions": "Maximum Questions",
        "questionOrdering": "Question Ordering",
        "questionOrderingOriginal": "Original",
        "questionOrderingRandom": "Random",
        "questionOrderingRandomBySection": "Random by Section",
        "testDeliveryMode": "Test Delivery Mode"
    }
}
</i18n>
