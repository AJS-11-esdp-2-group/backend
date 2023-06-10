import express, { Request, Router, Response } from 'express';
import db from '@src/db/db';
import { CreateGoodsDto } from '@src/dto/CreateGoods.dto';

const controller: Router = express.Router();

controller.get('/', async (req: Request, res: Response) => {
    try {
        const goods = await db.query('SELECT * FROM goods');
        res.send(goods.rows);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

controller.get('/:id', async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        const good = await db.query('SELECT * FROM goods WHERE id = $1', [id]);

        if (!good.rows.length) {
            return res.status(404).send({ error: 'Good not found' });
        }

        res.send(good.rows);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

controller.post('/', async (req: Request, res: Response) => {
    try {
        const {
            name,
            goods_description,
            goods_category,
            image_small,
            image_large,
            who_create
        } = req.body as CreateGoodsDto;
        const create_date = new Date().toISOString();
        const newGood = await db.query(
            `INSERT INTO goods (
                name, 
                goods_description,
                goods_category, 
                image_small, 
                image_large, 
                create_date,
                who_create ) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [name, goods_description, goods_category, image_small, image_large, create_date, who_create]
        );
        res.send(newGood.rows);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

controller.put('/:id', async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        const { name, goods_description, goods_category, image_small, image_large } = req.body as CreateGoodsDto;

        const good = await db.query('SELECT * FROM goods WHERE id = $1', [id]);

        if (!good.rows.length) {
            return res.status(404).send({ error: 'Good not found' });
        }

        const updatedGood = await db.query(
            `UPDATE goods SET 
                name = $1, 
                goods_description = $2, 
                goods_category = $3, 
                image_small = $4, 
                image_large = $5 
                WHERE id = $6
                RETURNING *`,
            [name, goods_description, goods_category, image_small, image_large, id]
        );

        res.send(updatedGood.rows);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

controller.delete('/:id', async (req: Request, res: Response) => {
    try {
        const id = req.params.id;

        const good = await db.query('SELECT * FROM goods WHERE id = $1', [id]);

        if (!good.rows.length) {
            return res.status(404).send({ error: 'Good not found' });
        }

        await db.query('DELETE FROM goods WHERE id = $1', [id]);

        res.send({ message: 'Good deleted successfully' });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

export default controller;