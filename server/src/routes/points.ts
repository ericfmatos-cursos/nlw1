import express            from 'express';
import multer             from 'multer';
import { celebrate, Joi } from 'celebrate';

import PointsController   from '../controllers/PointsController';
import multerConfig       from '../config/multer';

const pointsController = new PointsController();
const routes           = express.Router();
const upload           = multer(multerConfig);

routes.post('/',
            upload.single("image"),
            celebrate({
                body : Joi.object().keys({
                    name      : Joi.string().required(),
                    email     : Joi.string().required().email(),
                    whatsapp  : Joi.number().required(),
                    latitude  : Joi.number().required(),
                    longitude : Joi.number().required(),
                    city      : Joi.string().required(),
                    uf        : Joi.string().required().max(2),
                    items     : Joi.string().regex(/^\d+(,\d+)*$/i).required()
                })
            }, {
                abortEarly : false
            }), 
            pointsController.create);

routes.get ('/:id', pointsController.show);
routes.get ('/',    pointsController.index);


export default routes;