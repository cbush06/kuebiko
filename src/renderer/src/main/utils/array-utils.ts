export const ArrayUtils = {
    randomIndex: (a: Array<any>) => {
        return Math.floor(Math.random() * a.length);
    },
    randomEntry: (a: Array<any>) => {
        return a[ArrayUtils.randomIndex(a)];
    },
    randomEntryWithRemoval: <T>(a: Array<T>) => {
        const entryIndex = ArrayUtils.randomIndex(a);
        const entry: T = a[entryIndex];
        a.splice(entryIndex, 1);
        return entry;
    },
    shuffleArray(a: Array<any>) {
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
    },
};
