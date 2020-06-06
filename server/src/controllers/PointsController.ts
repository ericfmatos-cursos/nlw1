import { Request, Response } from 'express';
import DbPoints from '../db/controllers/points';

const dbPoints = new DbPoints();

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
        const point = { 
            image     : req.file.filename,
            name      : name.trim(),  
            email     : email.trim(), 
            whatsapp  : whatsapp, 
            latitude  : Number(latitude), 
            longitude : Number(longitude), 
            city      : city.trim(),    
            uf        : uf.trim()
        };
        const itemsArray = items.split(',').map((_item: string) => Number(_item.trim()));
        const point_id = await dbPoints.create(point, itemsArray);
        
        return res.json({ success: {id: point_id, ...point} });
        
    }

    async show(req: Request, res: Response) {
        const { id } = req.params;
        const result =  await dbPoints.get(Number(id));

        if (!result) {
            return res.status(404).json({msg: "point not found"});
        }

        return res.json(result);
    }

    async index(req: Request, res: Response) {
        const { city, uf, items } = req.query;
        const params = {
            city  : String(city  || ""), 
            uf    : String(uf    || ""), 
            items : String(items || "")
        }
        const result = await dbPoints.list(params);
        return res.json(result);
    }
}

export default PointsController;
