import Dexie, { Table } from 'dexie';
import { Test } from './models/test';
import { Attempt } from './models/attempt';
import { Question } from './models/question';
import { Resource } from './models/resource';

export class KuebikoDb extends Dexie {
    tests!: Table<Test>;
    questions!: Table<Question>;
    resources!: Table<Resource>;
    attempts!: Table<Attempt>;

    constructor() {
        super('kuebiko');
        this.version(1).stores({
            tests: '++uuid, title, tags',
            questions: '++uuid, categories',
            resources: '++uuid',
            attempts: '++uuid, testRef, status',
        });
        this.open();
    }

    static readonly INSTANCE = new KuebikoDb();
}
