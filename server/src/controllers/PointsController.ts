import knex from '../db/connection';
import { Request, Response } from 'express';

const serializePoint = (point: any) => {
    const data = {
        ...point,
        image_url : `/uploads/${point.image}`
    }

    const { image, ...result } = data;
    return  result;
}

class PointsController {
    
    async create(req: Request, res: Response) {
        const { name, email, whatsapp, latitude, longitude, city, uf, items } = req.body;
        
        const trx = await knex.transaction();
        const point = { 
            image     : req.file.filename,
            name      : name.trim(),  
            email     : email.trim(), 
            whatsapp  : whatsapp.trim(), 
            latitude  : Number(latitude), 
            longitude : Number(longitude), 
            city      : city.trim(),    
            uf        : uf.trim()
        };
        try {
            const ids = await trx('points').insert(point);
            const point_id = ids[0];
            const point_items = items
                .split(',')
                .map((item_id: string) => {
                    return {
                        item_id : parseInt(item_id.trim()),
                        point_id
                    }
                });
            await trx('point_items').insert(point_items);
            await trx.commit();
            return res.json({ success: {id: point_id, ...point} });
        } catch (e) {
            await trx.rollback();
            return res.status(500).json({ error: {...e} });
        }
    }

    async show(req: Request, res: Response) {
        const { id } = req.params;

        const point = await knex("points").where("id", id).first();
        if (!point) {
            return res.status(404).json({msg: "point not found"});
        }

        const items = await knex("items")
            .join("point_items", "items.id", "=", "point_items.item_id")
            .where("point_items.point_id", id)
            .select("items.id","items.title");

        return res.json({ 
            point : serializePoint(point), 
            items 
        });
    }

    async index(req: Request, res: Response) {
        const { city, uf, items } = req.query;
        const parsedItems = (items && String(items).split(',').map(item => Number(item.trim()))) || null;
        
        const points = await knex('points')
            .join("point_items", "points.id", "=", "point_items.point_id")
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
            
        
        return res.json(points.map(_point => serializePoint(_point)));
    }
}

export default PointsController;
