import express, { Request, Router, Response } from 'express';
import db from '@src/db/db';

const controller: Router = express.Router();

controller.get('/', async (req: Request, res: Response) => {
   try {
    const goods = await db.query(`SELECT * FROM goods`);
    res.send(goods.rows)
   } catch (error) {
    res.status(500).send({ error: error.message });
   }
})

controller.get('/:id', async(req: Request, res: Response) => {
    try {
        const id = req.params.id;
        const good = await db.query('SELECT * FROM goods WHERE id = $1', [id]);
        res.send(good.rows);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
})

export default controller;