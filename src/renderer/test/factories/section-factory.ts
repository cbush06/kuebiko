import { faker } from '@faker-js/faker';
import { Factory } from 'rosie';

export default new Factory()
    .option('questionsPerSection', undefined)
    .attr('uuid', () => faker.string.uuid())
    .attr('default', () => faker.datatype.boolean())
    .attr('title', () => faker.lorem.words(3))
    .attr('questionRefs', ['questionsPerSection'], (questionsPerSection?: number) =>
        // prettier-ignore
        (new Array(questionsPerSection ?? faker.number.int({min: 0, max: 10})))
            .fill(undefined)
            .map(() => faker.string.uuid()),
    );
