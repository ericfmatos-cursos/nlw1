import knex from '../db/connection';
import { Request, Response } from 'express';

class ItemsController {
    async index (req: Request, res: Response) {
        const items = await knex('items').select('*');
        const serializedItems = items.map(e => {
            return {
                id        : e.id,
                title     : e.title,
                image_url : `/uploads/${e.image}`
            }
        });
        return res.json(serializedItems);
    }
    }

export default ItemsController;