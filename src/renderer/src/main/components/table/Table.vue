<template>
    <table :class="`table is-fullwidth ${hoverable ? 'is-hoverable' : ''}`" :data-testid="id">
        <thead>
            <th
                v-for="column in columns"
                :class="{
                    sortable: column.sortable,
                    'is-clickable': column.sortable,
                    asc: currentSort?.key === column.key && currentSort?.direction === 'asc',
                    desc: currentSort?.key === column.key && currentSort?.direction === 'desc',
                }"
                @click="onSortClick(column)"
            >
                {{ column.title }}
            </th>
            <th v-if="$slots.controls"></th>
        </thead>
        <tbody v-if="preparedData?.length">
            <tr
                v-for="row in preparedData"
                :data-testid="props.rowKey ? `row-${row[props.rowKey]}` : undefined"
                :key="props.rowKey ? `row-${row[props.rowKey]}` : undefined"
                @click="onRowClick($event, row)"
                :class="`${clickable ? 'is-clickable' : ''}`"
            >
                <td v-for="column in columns">
                    <slot
                        v-if="!(column.editable && props.mode === 'edit')"
                        :name="propIdToString(column.key)"
                        :row="row"
                    >
                        {{ getColumnValue(column, row) }}
                    </slot>
                    <slot v-else :name="propIdToString(column.key) + '-edit'" :row="row">
                        <input
                            type="text"
                            class="input"
                            :id="propIdToString(column.key) + '-edit'"
                            :placeholder="column.title"
                            v-model="row[column.key]"
                        />
                    </slot>
                </td>
                <td v-if="$slots.controls">
                    <slot name="controls" :row="row"></slot>
                </td>
            </tr>
        </tbody>
        <tbody v-if="!preparedData?.length">
            <tr>
                <td :colspan="columns.length + ($slots.controls ? 1 : 0)">
                    <div class="notification is-info is-light is-flex is-justify-content-center">
                        {{ emptyTableMessage }}
                    </div>
                </td>
            </tr>
        </tbody>
        <tfoot v-if="$slots.footer">
            <tr>
                <td :colspan="columns.length + ($slots.controls ? 1 : 0)">
                    <slot name="footer"></slot>
                </td>
            </tr>
        </tfoot>
    </table>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

const emit = defineEmits(['rowClick']);

export interface SortBy<T> {
    key: keyof T;
    direction?: 'asc' | 'desc';
    computed?: TableColumn<T>['computed'];
}

export type ColumnComparator<T> = (direction: SortBy<T>['direction']) => (a: T, b: T) => number;

export interface TableColumn<T> {
    key: keyof T;
    title: string;
    computed?: (v: T) => any;
    formatter: (v: any) => string;
    sortable?: boolean;
    comparator?: ColumnComparator<T>;
    editable?: boolean;
}

export interface TableProps<T> {
    id?: string;
    rowKey?: string;
    data?: T[];
    columns: TableColumn<T>[];
    hoverable?: boolean;
    clickable?: boolean;
    sort?: SortBy<T>;
    noDataMessage?: string;
    noFilterResultsMessage?: string;
    mode?: 'view' | 'edit';
}

const props = defineProps<TableProps<any>>();

const currentSort = ref(props.sort);

const defaultComparator = <T,>(key, direction, computed?: TableColumn<T>['computed']) => {
    if (direction === 'asc') {
        if (computed)
            return (a, b) => (computed(a) === computed(b) ? 0 : computed(a) < computed(b) ? -1 : 1);
        return (a, b) => (a[key] === b[key] ? 0 : a[key] < b[key] ? -1 : 1);
    }
    if (computed)
        return (a, b) => (computed(a) === computed(b) ? 0 : computed(a) < computed(b) ? 1 : -1);
    return (a, b) => (a[key] === b[key] ? 0 : a[key] < b[key] ? 1 : -1);
};

const preparedData = computed(() => {
    if (currentSort.value) {
        const comparator = props.columns.filter((c) => c.key === currentSort.value?.key)?.[0]
            ?.comparator;

        // prettier-ignore
        return Array
            .of(...(props.data ?? []))
            .sort(comparator?.(currentSort.value.direction) ?? defaultComparator(currentSort.value.key, currentSort.value.direction, currentSort.value.computed));
    }
    return props.data;
});

const emptyTableMessage = computed(() => {
    if (!props.data?.length) return props.noDataMessage ?? 'There is no data to display.';
    if (!preparedData.value?.length)
        return props.noFilterResultsMessage ?? 'No results match your filter criteria.';
    return '';
});

const onSortClick = <T,>(column: TableColumn<T>) => {
    if (!column.sortable) return;

    let newSort = {
        key: column.key,
        computed: column.computed,
        direction: 'asc',
    } as SortBy<T> | undefined;

    if (currentSort.value?.key === column.key) {
        if (currentSort.value?.direction === 'asc') {
            newSort!.direction = 'desc';
        } else {
            newSort = undefined;
        }
    }

    currentSort.value = newSort;
};

const onRowClick = ($event: Event, item: any) => {
    if (!props.clickable) return;
    $event.stopPropagation();
    emit('rowClick', item);
};

const getColumnValue = <T,>(column: TableColumn<T>, row: any) => {
    const rawValue = column.computed ? column.computed(row) : row[column.key];
    if (column.formatter) return column.formatter(rawValue);
    return rawValue;
};

const propIdToString = (propId: keyof any) => {
    if (typeof propId === 'symbol') {
        return propId.description;
    }
    return propId.toString();
};
</script>

<style scoped lang="scss">
table {
    td {
        display: table-cell;
        vertical-align: middle;
    }

    th {
        display: table-cell;
        vertical-align: middle;

        &.sortable {
            &::after {
                display: inline-block;

                margin-top: auto;
                margin-bottom: auto;
                margin-left: 0.5rem;

                text-rendering: auto;
                font: var(--fa-font-solid);
                content: '\f0dc';
            }

            &.asc::after {
                content: '\f0de';
            }

            &.desc::after {
                content: '\f0dd';
            }
        }
    }
}
</style>
