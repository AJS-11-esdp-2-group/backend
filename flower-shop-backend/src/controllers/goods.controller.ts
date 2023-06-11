import express, { Request, Router, Response } from 'express';
import db from '@src/db/db';
import GoodsSchema, {Goods} from '@src/models/good.model';
import validate from '@src/middlewares/validateRequest';

const controller: Router = express.Router();

controller.get('/', async (req: Request, res: Response) => {
    try {
        const goods = await db.query(`
            SELECT g.id as id_good,
            g.name as name_good,
            g.goods_description,
            g.goods_category as id_category,
            gc.category as name_category,
            gc.category_description,
            g.image_small,
            g.image_large,g.create_date,
            g.who_create as id_create,
            e.name as name_create,
            e.job_title FROM goods g 
            INNER JOIN goods_categories gc on gc.id = g.goods_category 
            INNER JOIN employees e on e.id = g.who_create`);

        res.send(goods.rows);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

controller.get('/:id', async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        const good = await db.query(`
            SELECT g.id as id_good,
                g.name as name_good,
                g.goods_description,
                g.goods_category as id_category,
                gc.category as name_category,
                gc.category_description,
                g.image_small,
                g.image_large,
                g.create_date,
                g.who_create as id_create,
                e.name as name_create,
                e.job_title FROM goods g 
                INNER JOIN goods_categories gc on gc.id = g.goods_category 
                INNER JOIN employees e on e.id = g.who_create where g.id = $1`, 
                [id]);


        if (!good.rows.length) {
            return res.status(404).send({ error: 'Good not found' });
        }

        res.status(200).send(good.rows);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

controller.post('/', validate(GoodsSchema), async (req: Request, res: Response) => {
    try {
        const {
            name,
            goods_description,
            goods_category,
            image_small,
            image_large,
            who_create
        } = req.body as Goods;
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
        res.status(200).send(newGood.rows);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});


controller.put('/:id', validate(GoodsSchema), async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        const { name, goods_description, goods_category, image_small, image_large, who_create } = req.body as Goods;

        const good = await db.query('SELECT * FROM goods WHERE id = $1', [id]);

        if (!good.rows.length) {
            return res.status(400).send({ error: 'Good not found' });
        }

        const updatedGood = await db.query(
            `UPDATE goods SET 
                name = $1, 
                goods_description = $2, 
                goods_category = $3, 
                image_small = $4, 
                image_large = $5, 
                who_create = $6
                WHERE id = $7
                RETURNING *`,
            [name, goods_description, goods_category, image_small, image_large, who_create, id]
        );

        res.status(200).send(updatedGood.rows);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});


controller.delete('/:id', async (req: Request, res: Response) => {
    try {
        const id = req.params.id;

        const good = await db.query('SELECT * FROM goods WHERE id = $1', [id]);

        if (!good.rows.length) {
            return res.status(400).send({ error: 'Good not found' });
        }

        await db.query('DELETE FROM goods WHERE id = $1', [id]);

        res.status(200).send({ message: 'Good deleted successfully' });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

export default controller;