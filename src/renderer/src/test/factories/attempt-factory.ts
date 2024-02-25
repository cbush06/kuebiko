import { faker } from '@faker-js/faker';
import { Attempt, AttemptStatus } from '@renderer/db/models/attempt';
import { Factory } from 'rosie';
import QuestionResponseFactory from './question-response-factory';

export default new Factory<Attempt>()
    .attr('uuid', () => faker.string.uuid())
    .attr('testRef', () => faker.string.uuid())
    .attr('started', () => new Date())
    .attr('completed', () => faker.date.soon({ days: 5 }))
    .attr('status', () => faker.helpers.arrayElement<AttemptStatus>(['INPROGRESS', 'COMPLETED']))
    .attr('score', ['status'], (status: AttemptStatus) => {
        if (status === 'COMPLETED') return faker.number.int({ min: 0, max: 100 });
        return 0;
    })
    .attr('questionResponses', () =>
        // prettier-ignore
        new Array(faker.number.int({ min: 0, max: 10 }))
            .fill(undefined)
            .map(() => QuestionResponseFactory.build()),
    );
