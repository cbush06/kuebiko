import { Table } from 'dexie';
import { Question } from '@renderer/db/models/question';
import { Resource } from '@renderer/db/models/resource';
import { Test } from '@renderer/db/models/test';
import { KuebikoDb } from '@renderer/db/kuebiko-db';

export interface KuebikoDbFacade {
    INSTANCE: KuebikoDb;
    questions: Table<Question>;
    resources: Table<Resource>;
    tests: Table<Test>;
}
