import cors from 'cors';
import express from 'express';
import logger from 'jet-logger';
import goodsController from '@src/controllers/goods.controller'
import suppliersController from '@src/controllers/suppliers.controller';

const run = async () => {
    app.listen(PORT, () => {
        logger.info(`Server is running on http://localhost:${PORT}`)
    })
};

const app = express();
const PORT = 8000;

app.use(express.json());
app.use(express.static('public'));
app.use(cors());

app.use('/goods', goodsController);
app.use('/suppliers', suppliersController);

run().catch(logger.err);