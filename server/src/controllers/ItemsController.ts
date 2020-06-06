import { Request, Response } from 'express';
import DbItems from '../db/controllers/items';

const dbItems = new DbItems();

class ItemsController {
    async index (req: Request, res: Response) {
        const items = await dbItems.list();
        return res.json(items);
    }
}

export default ItemsController;