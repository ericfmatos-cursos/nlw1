import knex from './connection';
import Knex from 'knex';

export async function runTransaction (action: (trx: Knex.Transaction) => Promise<any>): Promise<any>  {
    const trx = await knex.transaction();
    let res = null;
    try {
        res = await action(trx);
        await trx.commit();
    } catch (er) {
        await trx.rollback();
        throw er;
    } 
    return res;
}


