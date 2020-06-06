import express      from 'express';

import route_items  from './routes/items';
import route_points from './routes/points';

const routes = express.Router();

routes.get('/', (req, res) => {
    return res.json({ msg : "Whats up!" });
});

routes.use('/items',  route_items);
routes.use('/points', route_points);

export default routes;