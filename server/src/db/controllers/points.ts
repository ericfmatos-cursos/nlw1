import knex           from '../../db/connection';
import { runTransaction } from '../../db/utils';
import Knex           from 'knex';

const TABLE_NAME  = 'points';
const PIVOT_TABLE = 'point_items';

interface PointData { 
    image     : string
    name      : string
    email     : string
    whatsapp  : string
    latitude  : number
    longitude : number
    city      : string
    uf        : string
}

interface ListParams {
    city  : string, 
    uf    : string, 
    items : string
}

class DbPoints {

    serializePoint (point: any)  {
        const data = {
            ...point,
            image_url : `/uploads/${point.image}`
        }
    
        const { image, ...result } = data;
        return  result;
    }
    

    async create (point: PointData, items: number[]): Promise<number>  {
        const point_id = await runTransaction(async (trx: Knex.Transaction) => {
            const ids      = await trx(TABLE_NAME).insert(point);
            const point_id = ids[0];
            const point_items = items.map((item_id) => {
                return {
                    item_id ,
                    point_id
                }
            });
            await trx(PIVOT_TABLE).insert(point_items);
            return point_id;
        });


        return point_id;
    }

    async get(id: number) {
        const point = await knex(TABLE_NAME).where("id", id).first();
        if (!point) {
            return null;
        }

        const items = await knex("items")
            .join("point_items", "items.id", "=", "point_items.item_id")
            .where("point_items.point_id", id)
            .select("items.id","items.title");

        return { 
            point : this.serializePoint(point), 
            items 
        };
    }

    async list(params: ListParams) {
        const { city, uf, items } = params
        const parsedItems = (items && String(items).split(',').map(item => Number(item.trim()))) || null;
        
        const points = await knex(TABLE_NAME)
            .join(PIVOT_TABLE, "points.id", "=", "point_items.point_id")
            .modify((queryBuilder) => {
                if (parsedItems && parsedItems.length) {
                    queryBuilder.whereIn("point_items.item_id", parsedItems);
                }
                if (city) {
                    queryBuilder.where  ("city", String(city));
                }
                if (uf) {
                    queryBuilder.where  ("uf",   String(uf));
                }
            })
            .distinct()
            .select("points.*");
        
        return points.map(_point => this.serializePoint(_point));
    }
}

export default DbPoints;