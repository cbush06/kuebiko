import RangeVue from '@renderer/components/range/Range.vue';
import { render } from '@testing-library/vue';

describe("<Range />", () => {
    it("renders range slider", () => {
        const { getByTestId } = render(RangeVue, {
            props: {
                max: 5,
                min: 1,
                ticks: 5,
                id: "range-slider",
                showValueAtEnd: true,
            }
        });

        expect(getByTestId("range-slider-input")).toBeInTheDocument();
        expect(getByTestId("range-slider-input")).toHaveValue(5); // should default to max
        
        expect(getByTestId("range-slider-value")).toBeInTheDocument();
        expect(getByTestId("range-slider-value")).toHaveTextContent("5");
        
        const ticks = getByTestId("range-slider-datalist") as HTMLDataListElement;
        expect(ticks).toBeInTheDocument();
        
        const tickOptions = ticks.querySelectorAll("option");
        expect(tickOptions).toHaveLength(5);
        
        for (const [i, tick] of tickOptions.entries()) {
            expect(tick).toHaveTextContent(`${i + 1}`);
        }
    });

    it("renders range slider with custom tick labels", () => {
        const ticksValues = [ "One", "Two", "Three", "Four", "Five" ];
        const { getByTestId } = render(RangeVue, {
            props: {
                max: 5,
                min: 1,
                ticks: ticksValues,
                id: 'range-slider',
                showValueAtEnd: true,
            },
        });

        const ticks = getByTestId('range-slider-datalist') as HTMLDataListElement;
        expect(ticks).toBeInTheDocument();

        const tickOptions = ticks.querySelectorAll('option');
        expect(tickOptions).toHaveLength(5);

        for (const [i, tick] of tickOptions.entries()) {
            expect(tick).toHaveTextContent(ticksValues[i]);
        }
    });
});