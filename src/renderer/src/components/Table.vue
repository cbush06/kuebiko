<template>
    <table :class="`table is-fullwidth ${hoverable ? 'is-hoverable' : ''}`">
        <thead>
            <th v-for="column in columns">
                {{ column.title }}
            </th>
        </thead>
        <tbody v-if="preparedData?.length">
            <tr v-for="row in preparedData" @click="onRowClick($event, row)" :class="`${clickable ? 'is-clickable' : ''}`">
                <td v-for="column in columns">
                    {{ row[column.key] }}
                </td>
            </tr>
        </tbody>
        <tbody v-if="!preparedData?.length">
            <tr>
                <td :colspan="columns.length">
                    <div class="container">
                        <div class="notification is-info is-light is-flex is-justify-content-center">
                            {{ emptyTableMessage }}
                        </div>
                    </div>
                </td>
            </tr>
        </tbody>
    </table>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

const emit = defineEmits(['rowClick']);

export interface SortBy {
    key: string;
    comparator?: (a, b) => number;
    direction?: 'asc' | 'desc';
}

export interface TableColumn {
    key: string;
    title: string;
}

export interface TableProps {
    data?: any[];
    columns: TableColumn[];
    hoverable?: boolean;
    clickable?: boolean;
    sort?: SortBy;
    noDataMessage?: string;
    noFilterResultsMessage?: string;
}

const props = defineProps<TableProps>();

const currentSort = ref(props.sort);
const defaultComparator = (key, direction) => {
    if (direction === 'asc') {
        if (key) return (a, b) => (a[key] === b[key] ? 0 : a[key] < b[key] ? -1 : 1);
        else return (a, b) => (a === b ? 0 : a < b ? -1 : 1);
    }

    if (key) return (a, b) => (a[key] === b[key] ? 0 : a[key] < b[key] ? 1 : -1);
    else return (a, b) => (a === b ? 0 : a < b ? 1 : -1);
};

const preparedData = computed(() => {
    if (currentSort.value) {
        // prettier-ignore
        return Array
            .of(...(props.data ?? []))
            .sort(currentSort.value.comparator ?? defaultComparator(currentSort.value.key, currentSort.value.direction));
    }
    return props.data;
});

const emptyTableMessage = computed(() => {
    if (!props.data?.length) return props.noDataMessage ?? 'There is no data to display.';
    if (!preparedData.value?.length) return props.noFilterResultsMessage ?? 'No results match your filter criteria.';
    return '';
});

const onRowClick = ($event: Event, item: any) => {
    if (!props.clickable) return;
    $event.stopPropagation();
    emit('rowClick', item);
};
</script>

<style scoped lang="scss"></style>
