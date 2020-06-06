import express from 'express';

import ItemsController from '../controllers/ItemsController';

const itemsController = new ItemsController();
const routes          = express.Router();

routes.get ('/', itemsController.index);

export default routes;