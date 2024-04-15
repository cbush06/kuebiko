import TableVue, { ColumnComparator } from '@renderer/components/table/Table.vue';
import userEvent from '@testing-library/user-event';
import { render } from '@testing-library/vue';

describe('table component', () => {
    it('renders headers and default cells', () => {
        const rows = [
            { id: 0, breed: 'Poodle', age: 1, name: 'Reese' },
            { id: 1, breed: 'Aussie', age: 4, name: 'Abby' },
            { id: 2, breed: 'Pug', age: 5, name: 'Faye' },
        ];

        const columns = [
            { key: 'breed', title: 'Breed' },
            { key: 'age', title: 'Age' },
            { key: 'name', title: 'Name' },
        ];

        const { getByText, getByTestId } = render(TableVue, {
            props: {
                id: 'dogs-table',
                rowKey: 'id',
                data: rows,
                columns: columns,
            },
        });

        // prettier-ignore
        columns.map(c => c.title)
            .forEach((title) =>
                expect(getByText(title, { selector: 'th' })).toBeInTheDocument()
            );

        rows.forEach(({ id, breed, age, name }) => {
            expect(getByTestId(`row-${id}`)).toBeInTheDocument();
            expect(getByTestId(`row-${id}`)).toContainElement(getByText(breed));
            expect(getByTestId(`row-${id}`)).toContainElement(getByText(age));
            expect(getByTestId(`row-${id}`)).toContainElement(getByText(name));
        });
    });

    it('displays no data message when empty', async () => {
        const columns = [
            { key: 'breed', title: 'Breed' },
            { key: 'age', title: 'Age' },
            { key: 'name', title: 'Name' },
        ];

        const { getByTestId, rerender } = render(TableVue, {
            props: {
                id: 'dogs-table',
                rowKey: 'id',
                data: [],
                columns: columns,
            },
        });

        // Confirm default message is shown
        expect(getByTestId('dogs-table')).toHaveTextContent(/.*There is no data to display.*/);

        // Use custom message
        await rerender({
            id: 'dogs-table',
            rowKey: 'id',
            data: [],
            columns: columns,
            noDataMessage: "Oops! We're all out of dogs...",
        });

        // Confirm default message is shown
        expect(getByTestId('dogs-table')).toHaveTextContent(/.*Oops! We're all out of dogs....*/);
    });

    it('sorts with default comparator', async () => {
        const user = userEvent.setup();

        const rows = [
            { id: 0, breed: 'Border Collie', age: 1, name: 'Wyatt' },
            { id: 1, breed: 'Aussie', age: 4, name: 'Abby' },
            { id: 2, breed: 'Pug', age: 5, name: 'Faye' },
        ];

        const columns = [
            { key: 'breed', title: 'Breed', sortable: true },
            { key: 'age', title: 'Age', sortable: true },
            { key: 'name', title: 'Name', sortable: true },
        ];

        const { getByText, getByTestId } = render(TableVue, {
            props: {
                id: 'dogs-table',
                rowKey: 'id',
                data: rows,
                columns: columns,
            },
        });

        // Sort icons are shown
        // prettier-ignore
        columns.map(c => c.title)
            .forEach((title) => {
                const header = getByText(title, { selector: 'th' });
                expect(header).toBeInTheDocument()
                expect(header).toHaveClass('sortable', 'is-clickable');
                expect(header).not.toHaveClass('asc', 'desc');
            });

        // Sort ASC by Breed
        await user.click(getByText('Breed', { selector: 'th' }));

        // Confirm sort occurred
        expect(getByText('Breed', { selector: 'th' })).toHaveClass('asc');
        let breedColumnValues = Array.from(
            getByTestId('dogs-table').querySelectorAll('tbody > tr > td:nth-child(1)'),
        ).map((e) => e.textContent);
        expect(breedColumnValues).toEqual(['Aussie', 'Border Collie', 'Pug']);

        // Sort DESC by Breed
        await user.click(getByText('Breed', { selector: 'th' }));

        // Confirm sort occurred
        expect(getByText('Breed', { selector: 'th' })).toHaveClass('desc');
        breedColumnValues = Array.from(
            getByTestId('dogs-table').querySelectorAll('tbody > tr > td:nth-child(1)'),
        ).map((e) => e.textContent);
        expect(breedColumnValues).toEqual(['Pug', 'Border Collie', 'Aussie']);

        // Sort ASC by Name
        await user.click(getByText('Age', { selector: 'th' }));

        // Confirm sort occurred
        expect(getByText('Breed', { selector: 'th' })).not.toHaveClass('asc', 'desc');
        expect(getByText('Age', { selector: 'th' })).toHaveClass('asc');
        let nameColumnValues = Array.from(
            getByTestId('dogs-table').querySelectorAll('tbody > tr > td:nth-child(2)'),
        ).map((e) => e.textContent);
        expect(nameColumnValues).toEqual(['1', '4', '5']);
    });

    it('shows and sorts computed value with default comparator', async () => {
        const user = userEvent.setup();

        const rows = [
            { id: 0, breed: 'Border Collie', age: 1, name: 'Wyatt' },
            { id: 1, breed: 'Aussie', age: 4, name: 'Abby' },
            { id: 2, breed: 'Pug', age: 5, name: 'Faye' },
        ];

        const columns = [
            { key: 'breed', title: 'Breed', sortable: true },
            { key: 'age', title: 'Age', sortable: true },
            { key: 'dogYears', title: 'Dog Years', sortable: true, computed: (r) => r['age'] * 7 },
            { key: 'name', title: 'Name', sortable: true },
        ];

        const { getByText, getByTestId } = render(TableVue, {
            props: {
                id: 'dogs-table',
                rowKey: 'id',
                data: rows,
                columns: columns,
            },
        });

        // prettier-ignore
        rows.forEach(({id, age}) => {
            expect(getByTestId(`row-${id}`).children[2].textContent).toBe((age*7).toString());
        });

        // Sort asc
        await user.click(getByText('Dog Years', { selector: 'th' }));

        // Confirm sorted ascending
        expect(getByText('Dog Years', { selector: 'th' })).toHaveClass('asc');
        let dogYearsValues = Array.from(
            getByTestId('dogs-table').querySelectorAll('tbody tr td:nth-child(3)'),
        ).map((e) => e.textContent);
        expect(dogYearsValues).toEqual(['7', '28', '35']);

        // Sort desc
        await user.click(getByText('Dog Years', { selector: 'th' }));

        // Confirm sorted descending
        expect(getByText('Dog Years', { selector: 'th' })).toHaveClass('desc');
        dogYearsValues = Array.from(
            getByTestId('dogs-table').querySelectorAll('tbody tr td:nth-child(3)'),
        ).map((e) => e.textContent);
        expect(dogYearsValues).toEqual(['35', '28', '7']);
    });

    it('sorts column with custom comparator', async () => {
        const user = userEvent.setup();

        const demeanorMapper = (d) => {
            switch (d) {
                case 'Aggressive':
                    return 3;
                case 'Protective':
                    return 2;
                case 'Playful':
                    return 1;
                default:
                    return 0;
            }
        };

        const demeanorComparator: ColumnComparator<{ demeanor: any }> = (direction) => {
            return (a, b) => {
                const aNumeric = demeanorMapper(a.demeanor);
                const bNumeric = demeanorMapper(b.demeanor);
                const comparison = aNumeric === bNumeric ? 0 : aNumeric > bNumeric ? 1 : -1;

                return direction === 'desc' ? comparison * -1 : comparison;
            };
        };

        const rows = [
            { id: 0, breed: 'Border Collie', age: 1, name: 'Wyatt', demeanor: 'Protective' },
            { id: 1, breed: 'Aussie', age: 4, name: 'Abby', demeanor: 'Aggressive' },
            { id: 2, breed: 'Pug', age: 5, name: 'Faye', demeanor: 'Lapdog' },
        ];

        const columns = [
            { key: 'breed', title: 'Breed', sortable: true },
            { key: 'age', title: 'Age', sortable: true },
            { key: 'name', title: 'Name', sortable: true },
            { key: 'demeanor', title: 'Demeanor', sortable: true, comparator: demeanorComparator },
        ];

        const { getByText, getByTestId } = render(TableVue, {
            props: {
                id: 'dogs-table',
                rowKey: 'id',
                data: rows,
                columns: columns,
            },
        });

        // Sort demeanor ascending
        await user.click(getByText('Demeanor', { selector: 'th' }));

        // Confirm sort asc
        let demeanorValues = Array.from(
            getByTestId('dogs-table').querySelectorAll('tbody > tr > td:nth-child(4)'),
        ).map((e) => e.textContent);
        expect(demeanorValues).toEqual(['Lapdog', 'Protective', 'Aggressive']);

        // Sort demeanor ascending
        await user.click(getByText('Demeanor', { selector: 'th' }));

        // Confirm sort desc
        demeanorValues = Array.from(
            getByTestId('dogs-table').querySelectorAll('tbody > tr > td:nth-child(4)'),
        ).map((e) => e.textContent);
        expect(demeanorValues).toEqual(['Aggressive', 'Protective', 'Lapdog']);
    });

    it('executes callback when a row is clicked', async () => {
        const user = userEvent.setup();

        const rows = [
            { id: 0, breed: 'Poodle', age: 1, name: 'Reese' },
            { id: 1, breed: 'Aussie', age: 4, name: 'Abby' },
            { id: 2, breed: 'Pug', age: 5, name: 'Faye' },
        ];

        const columns = [
            { key: 'breed', title: 'Breed' },
            { key: 'age', title: 'Age' },
            { key: 'name', title: 'Name' },
        ];

        const { getByTestId, emitted } = render(TableVue, {
            props: {
                id: 'dogs-table',
                rowKey: 'id',
                data: rows,
                columns: columns,
                clickable: true,
            },
        });

        const row0 = getByTestId('row-0');
        await user.click(row0);

        const rowClicked = emitted('rowClick');
        expect(rowClicked[0]).toEqual([rows[0]]);
    });
});
