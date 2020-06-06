import knex from '../../db/connection';

const TABLE_NAME = 'items';

interface Item {
    id        : number,
    title     : string,
    image_url : string
}

class DbItems {
    async list () : Promise<Item[]> {
        const items = await knex(TABLE_NAME).select('*');
        const serializedItems = items.map(e => {
            return {
                id        : e.id,
                title     : e.title,
                image_url : `/assets/${e.image}`
            }
        });
        return serializedItems;
    }
}

export default DbItems;