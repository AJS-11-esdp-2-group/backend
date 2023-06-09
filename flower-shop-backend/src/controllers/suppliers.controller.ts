import express, { Request, Router, Response } from 'express';
import db from '@src/db/db';

const controller: Router = express.Router();

controller.get('/', async (req: Request, res: Response) => {
   try {
    const suppliers = await db.query('SELECT * FROM suppliers');
    res.send(suppliers.rows)
   } catch (error) {
    res.status(500).send({ error: error.message });
   }
})

controller.get('/:id', async(req: Request, res: Response) => {
    try {
        const id = req.params.id;
        const supplier = await db.query('SELECT * FROM suppliers WHERE id = $1', [id]);
        res.send(supplier.rows);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
})

export default controller;