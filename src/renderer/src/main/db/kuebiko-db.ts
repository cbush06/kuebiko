import { Dexie, Table } from 'dexie';
import { Attempt } from './models/attempt';
import { Question } from './models/question';
import { Resource } from './models/resource';
import { Test } from './models/test';

export class KuebikoDb extends Dexie {
    tests!: Table<Test>;
    questions!: Table<Question>;
    resources!: Table<Resource>;
    attempts!: Table<Attempt>;

    editorTests!: Table<Test>;
    editorResources!: Table<Resource>;
    editorQuestions!: Table<Question>;

    constructor() {
        super('kuebiko');
        this.version(1).stores({
            tests: '++uuid, title, *tags',
            questions: '++uuid, *categories',
            resources: '++uuid',
            attempts: '++uuid, testRef, status',
            editorTests: '++uuid, title, *tags',
            editorQuestions: '++uuid, *categories',
            editorResources: '++uuid',
        });
        this.open();
    }

    static readonly INSTANCE = new KuebikoDb();
}
