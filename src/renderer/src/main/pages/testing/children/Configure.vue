<template>
    <div class="section">
        <h1 class="title">{{ t('configureTest') }}</h1>

        <h2 class="subtitle">{{ t('testDeliveryMode') }}</h2>
        <div class="block ml-5">
            <BulmaOptionGroup
                v-model="testConfigurationStore.format"
                name="test-delivery-mode"
                orientation="column"
                icon-class="has-text-primary"
            >
                <BulmaOption value="SIMULATE" data-testid="test-delivery-mode-simulate">
                    {{ t('simulate') }}
                </BulmaOption>
                <BulmaOption value="PREPARE" data-testid="test-delivery-mode-prepare">
                    {{ t('prepare') }}
                </BulmaOption>
            </BulmaOptionGroup>
        </div>

        <div
            data-testid="configure-duration"
            v-if="testConfigurationStore.format === 'SIMULATE'"
            class="block"
        >
            <h2 class="subtitle">{{ t('duration') }}</h2>
            <div class="block ml-5">
                <div class="field">
                    <div class="control has-icons-left">
                        <span class="icon is-small is-left">
                            <i class="fa-solid fa-stopwatch"></i>
                        </span>
                        <VueMask
                            v-model="duration"
                            :mask="durationMask"
                            @accept="clearTestConfigurationDuration"
                            @complete="updateTestConfigurationDuration"
                            style="width: 8rem"
                            class="input is-inline"
                            :class="{ 'is-danger': !testConfigurationStore.duration }"
                        />
                    </div>
                </div>
            </div>
        </div>

        <div class="subtitle">{{ t('questionOrdering') }}</div>
        <div class="block ml-5">
            <BulmaOptionGroup
                v-model="testConfigurationStore.order"
                name="question-ordering"
                orientation="column"
                icon-class="has-text-primary"
            >
                <BulmaOption value="ORIGINAL" data-testid="question-ordering-original">
                    {{ t('questionOrderingOriginal') }}
                </BulmaOption>
                <BulmaOption value="RANDOM" data-testid="question-ordering-random">
                    {{ t('questionOrderingRandom') }}
                </BulmaOption>
                <BulmaOption
                    value="RANDOM_BY_SECION"
                    data-testid="question-ordering-random-by-section"
                >
                    {{ t('questionOrderingRandomBySection') }}
                </BulmaOption>
            </BulmaOptionGroup>
        </div>

        <!-- OPTIONS BELOW ARE ONLY ALLOWED FOR RANDOM & RANDOM_PER_SECTION ORDERING -->
        <div
            data-testid="question-filters"
            v-if="testConfigurationStore.order !== 'ORIGINAL'"
            class="block"
        >
            <div class="subtitle">{{ t('filterQuestions') }}</div>
            <div class="block ml-5">
                <div class="level">
                    <div class="level-left">
                        <label class="level-item">By Section</label>
                        <Multiselect
                            data-testid="section-filter"
                            class="level-item is-block"
                            style="min-width: 30rem"
                            v-model="filterBySection"
                            :options="sectionOptions"
                            track-by="uuid"
                            multiple
                            :close-on-select="false"
                            :clear-on-select="false"
                            label="title"
                        />
                    </div>
                </div>
                <div class="level">
                    <div class="level-left">
                        <label class="level-item">By Category</label>
                        <Multiselect
                            data-testid="category-filter"
                            class="level-item is-block"
                            style="min-width: 30rem"
                            v-model="filterByCategory"
                            :options="categoryOptions"
                            multiple
                            :close-on-select="false"
                            :clear-on-select="false"
                        />
                    </div>
                </div>
            </div>

            <div class="subtitle">{{ t('maximumQuestions') }}</div>
            <div class="block ml-5">
                <div class="field is-grouped">
                    <div class="control is-expanded">
                        <input
                            data-testid="max-questions"
                            type="range"
                            class="slider is-fullwidth is-primary"
                            min="0"
                            :value="testConfigurationStore.maxQuestions"
                            @input="
                                testConfigurationStore.maxQuestions = parseInt(
                                    ($event.target! as HTMLInputElement).value,
                                )
                            "
                            :max="availableQuestions"
                        />
                    </div>
                    <div
                        class="control is-flex is-flex-direction-row is-align-content-center is-flex-wrap-wrap"
                        style="width: 5rem"
                    >
                        <input
                            data-testid="max-questions-value"
                            type="text"
                            class="input has-text-white has-background-dark has-text-centered is-unselectable"
                            :value="testConfigurationStore.maxQuestions"
                            disabled
                        />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { Question } from '@renderer/db/models/question';
import { Test } from '@renderer/db/models/test';
import { useTestConfigurationStore } from '@renderer/store/test-configuration-store/test-configuration-store';
import { AbstractQuestionFilter } from '@renderer/store/test-delivery-store/question-filter/abstract-question-filter';
import { CategoryQuestionFilter } from '@renderer/store/test-delivery-store/question-filter/category-question-filter';
import { CompoundQuestionFilter } from '@renderer/store/test-delivery-store/question-filter/compound-question-filter';
import { MatchAllQuestionFilter } from '@renderer/store/test-delivery-store/question-filter/match-all-question-filter';
import { SectionQuestionFilter } from '@renderer/store/test-delivery-store/question-filter/section-question-filter';
import {
    clockFormatToDuration,
    durationMask,
    durationToClockFormat,
} from '@renderer/utils/datetime-utils';
import { nextTick, onBeforeMount, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { IMaskComponent as VueMask } from 'vue-imask';
import { Multiselect } from 'vue-multiselect';
import { useRoute } from 'vue-router';
import BulmaOptionGroup from '@renderer/components/bulma-option/BulmaOptionGroup.vue';
import BulmaOption from '@renderer/components/bulma-option/BulmaOption.vue';
import { DeliveryTestObjectProvider } from '@renderer/services/delivery-test-object-provider';

interface SectionOption {
    title: string;
    uuid: string;
}

const { t } = useI18n();
const route = useRoute();
const testConfigurationStore = useTestConfigurationStore();

const sectionOptions = ref<SectionOption[]>([]);
const filterBySection = ref<SectionOption[]>([]);

const categoryOptions = ref<string[]>([]);
const filterByCategory = ref<string[]>([]);

const availableQuestions = ref<number>();

const test = ref<Test>();
const testQuestions = ref<Question[]>([]);

const duration = ref<string>('');

onBeforeMount(async () => {
    test.value = await DeliveryTestObjectProvider.fetchTest(route.params['testUuid'] as string);
    duration.value = durationToClockFormat(test.value?.allowedTime ?? 0);
    testQuestions.value.push(
        ...((await DeliveryTestObjectProvider.fetchQuestions(
            test.value?.sections.flatMap((s) => s.questionRefs) ?? [],
        )) as Question[]),
    );
    availableQuestions.value =
        test.value?.sections.reduce((cnt, s) => (cnt += s.questionRefs.length), 0) ?? 0;
    sectionOptions.value.push(
        ...(test.value?.sections.flatMap(
            (s) => ({ title: s.title, uuid: s.uuid }) as SectionOption,
        ) ?? []),
    );
    categoryOptions.value.push(...getUniqueCategoriesFromQuestions(testQuestions.value));

    testConfigurationStore.duration = test.value?.allowedTime;
    testConfigurationStore.filter = new MatchAllQuestionFilter(test.value!);

    nextTick(() => (testConfigurationStore.maxQuestions = availableQuestions.value));
});

const clearTestConfigurationDuration = () => {
    testConfigurationStore.duration = undefined;
};

const updateTestConfigurationDuration = (v: string) => {
    testConfigurationStore.duration = clockFormatToDuration(v);
};

watch(
    () => testConfigurationStore.format,
    (newFormat) => {
        if (newFormat === 'SIMULATE') testConfigurationStore.duration = test.value?.allowedTime;
    },
);

watch(
    () => filterBySection,
    async (selectedSections) => {
        const selectedSectionUuids = selectedSections.value.map((s) => s.uuid);

        testConfigurationStore.filter = new SectionQuestionFilter(
            selectedSectionUuids,
            test.value!,
        );

        const matchingQuestions = testQuestions.value.filter((q) =>
            testConfigurationStore.filter?.match(q),
        );

        availableQuestions.value = matchingQuestions.length;

        filterByCategory.value.splice(0);
        categoryOptions.value.splice(0);
        categoryOptions.value.push(...getUniqueCategoriesFromQuestions(matchingQuestions));

        nextTick(() => (testConfigurationStore.maxQuestions = availableQuestions.value));
    },
    { deep: true },
);

watch(
    () => filterByCategory,
    async (selectedCategories) => {
        const selectedSectionUuids = filterBySection.value.map((s) => s.uuid);

        testConfigurationStore.filter = new CompoundQuestionFilter(test.value!, [
            new SectionQuestionFilter(selectedSectionUuids, test.value!),
            new CategoryQuestionFilter(selectedCategories.value, test.value!),
        ]);

        const matchingQuestions = testQuestions.value.filter((q) =>
            testConfigurationStore.filter?.match(q),
        );
        availableQuestions.value = matchingQuestions.length;

        nextTick(() => (testConfigurationStore.maxQuestions = availableQuestions.value));
    },
    { deep: true },
);

const getUniqueCategoriesFromQuestions = (questions: Question[]) => {
    // prettier-ignore
    return Array.from(
        questions
            .flatMap(q => q.categories)
            .reduce((set, category) => {
                set.add(category);
                return set;
            }, new Set<string>())
    ).sort();
};

// prettier-ignore
watch([
        () => testConfigurationStore.order,
        () => testConfigurationStore.format,
        filterBySection,
        filterByCategory,
        () => testConfigurationStore.maxQuestions
    ], () => {
        const filters = new Array<AbstractQuestionFilter>();

        if (filterBySection.value.length) {
            filters.push(new SectionQuestionFilter(filterBySection.value.map(s => s.uuid), test.value!));
        }

        if (filterByCategory.value.length) {
            filters.push(new CategoryQuestionFilter(filterByCategory.value, test.value!));
        }

        testConfigurationStore.filter = new CompoundQuestionFilter(test.value!, filters);
    });

const testVal = ref(['green']);
watch(testVal, (n) => console.log(n));
</script>

<style scoped lang="scss"></style>

<i18n lang="json">
{
    "en": {
        "configureTest": "Configure Your Test",
        "duration": "Duration",
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
