import { faker } from '@faker-js/faker';
import { Question, QuestionType } from '@renderer/db/models/question';
import { Factory } from 'rosie';
import optionFactory from './option-factory';

export default new Factory<Question>()
    .attr('uuid', () => faker.string.uuid())
    .attr('type', () => faker.helpers.arrayElement<QuestionType>(['MULTIPLE', 'MANY', 'POINT', 'FILL', 'SHORT', 'LONG']))
    .attr('contentRef', () => faker.string.uuid())
    .attr('answer', () => {
        // Return either a uuid (45%), an array of uuids (45%), or nothing (10%)
        const n = faker.number.float();
        if (n > 0.55) {
            return faker.string.uuid();
        } else if (n > 0.1) {
            return new Array(faker.number.int({ min: 0, max: 5 })).fill(undefined).map(() => faker.string.uuid());
        } else {
            return undefined;
        }
    })
    .attr('options', () => optionFactory.buildList(faker.number.int({ min: 0, max: 4 })));
