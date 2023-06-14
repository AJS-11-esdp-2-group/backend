import express, { Request, Router, Response } from 'express';
import db from '@src/db/db';
import ItemsSchema, { Items } from '@src/models/item.model';
import validate from '@src/middlewares/validateRequest';

const controller: Router = express.Router();

controller.get('/', async (req: Request, res: Response) => {
    try {
        const item = await db.query(`
            SELECT i.id_item,
            i.item_name,
            i.item_description,
            ic.category_name,
            ic.category_name_description,
            i.image_small,
            i.image_large,
            i.create_date,
            i.id_user AS id_create,
            e.name_employee,
            e.job_title
            FROM items i
            INNER JOIN items_categories ic ON ic.id_category = i.id_category
            INNER JOIN employees e ON e.id_employee = i.id_user`);

        res.status(200).send(item.rows);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

controller.get('/:id', async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        const item = await db.query(`
            SELECT i.id_item,
            i.item_name,
            i.item_description,
            ic.category_name,
            ic.category_name_description,
            i.image_small,
            i.image_large,
            i.create_date,
            i.id_user AS id_create,
            e.name_employee,
            e.job_title
            FROM items i
            INNER JOIN items_categories ic ON ic.id_category = i.id_category
            INNER JOIN employees e ON e.id_employee = i.id_user
            WHERE i.id_item = $1`,
            [id]);


        if (!item.rows.length) {
            return res.status(404).send({ error: 'Item not found' });
        }

        res.status(200).send(item.rows);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

controller.post('/', validate(ItemsSchema), async (req: Request, res: Response) => {
    try {
        const {
            item_name,
            item_description,
            id_category,
            image_small,
            image_large,
            id_user
        } = req.body as Items;
        const create_date = new Date().toISOString();
        const newItem = await db.query(
            `INSERT INTO items (
                item_name,
                item_description,
                id_category,
                image_small, 
                image_large, 
                create_date,
                id_user ) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [item_name, item_description, id_category, image_small, image_large, create_date, id_user]
        );
        res.status(200).send(newItem.rows);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});


controller.put('/:id', validate(ItemsSchema), async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        const { item_name, item_description, id_category, image_small, image_large, id_user } = req.body as Items;

        const item = await db.query('SELECT * FROM items WHERE id_item = $1', [id]);

        if (!item.rows.length) {
            return res.status(400).send({ error: 'Item not found' });
        }

        const updatedItem = await db.query(
            `UPDATE items SET 
                item_name = $1, 
                item_description = $2, 
                id_category = $3, 
                image_small = $4, 
                image_large = $5, 
                id_user = $6
                WHERE id_item = $7
                RETURNING *`,
            [item_name, item_description, id_category, image_small, image_large, id_user, id]
        );

        res.status(200).send(updatedItem.rows);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

controller.delete('/:id', async (req: Request, res: Response) => {
    try {
        const id = req.params.id;

        const item = await db.query('SELECT * FROM items WHERE id_item = $1', [id]);

        if (!item.rows.length) {
            return res.status(400).send({ error: 'Item not found' });
        }

        await db.query('DELETE FROM items WHERE id_item = $1', [id]);

        res.status(200).send({ message: 'Item deleted successfully' });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});


export default controller;