/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import validate from '@src/middlewares/validateRequest';
import ItemsPricesSchema from '@src/models/itemsPrices';
import express, { Request, Router, Response } from 'express';
import db from '@src/db/db';

const controller: Router = express.Router();

controller.get('/', async (req: Request, res: Response) => {
  try {
    const itemsPrices = await db.query(
      'SELECT * FROM items_prices',
    );
    res.status(200).send(itemsPrices.rows);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

controller.post('/', validate(ItemsPricesSchema), async (req: Request, res: Response) => {
  try {
    const { item_id, price } = req.body;
    const added_date = new Date().toISOString();
    const newPrice = await db.query(
      `INSERT INTO items_prices (item_id, price, added_date)
         VALUES ($1, $2, $3)
         RETURNING *`,
      [item_id, price, added_date],
    );
    res.status(200).send({
      message: 'Price added successfully',
      price: newPrice.rows[0],
    });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});
  

export default controller;
