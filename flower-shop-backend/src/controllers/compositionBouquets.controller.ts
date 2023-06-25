import express, { Request, Router, Response } from 'express';
import db from '@src/db/db';
import CompositionBouquetsSchema,
{ CompositionBouquets } from '@src/models/compositionBouquets';
import validate from '@src/middlewares/validateRequest';

const controller: Router = express.Router();

controller.get('/', async (req: Request, res: Response) => {
    try {
        const compositionBouquets = await db.query(
    `SELECT
    b.bouquet_name,
    STRING_AGG(CONCAT(i.item_name, ' (', c.qty, ')'), ', ') AS items_included,
    SUM(c.price) AS total_price
  FROM
    composition_of_bouquets c
    INNER JOIN bouquets b ON b.id = c.id_bouquet
    INNER JOIN items i ON i.id = c.id_item
  GROUP BY
    b.bouquet_name;
  `,
        );
        res.status(200).send(compositionBouquets.rows);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

controller.get('/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const composition = await db.query(`
        SELECT
          c.id,
          c.id_bouquet,
          c.id_item,
          c.qty,
          c.price
        FROM
          composition_of_bouquets c
        WHERE
          c.id = $1;
      `, [id]);
  
      if (composition.rows.length === 0) {
        res.status(400).send({ error: 'Composition not found' });
      } else {
        res.status(200).send(composition.rows[0]);
      }
    } catch (error) {
      res.status(500).send({ error: error.message });
    }
});
  

controller.post('/', validate(CompositionBouquetsSchema), async (req: Request, res: Response) => {
    try {
        const { id_bouquet, id_item, qty, price } = req.body as CompositionBouquets;
        const newComposition = await db.query(`
        INSERT INTO composition_of_bouquets (id_bouquet, id_item, qty, price)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `, [id_bouquet, id_item, qty, price]);

        res.status(200).send(newComposition.rows[0]);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

controller.put('/:id', validate(CompositionBouquetsSchema), async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { id_bouquet, id_item, qty, price } = req.body as CompositionBouquets;
  
      const updatedComposition = await db.query(`
        UPDATE composition_of_bouquets
        SET id_bouquet = $1, id_item = $2, qty = $3, price = $4
        WHERE id = $5
        RETURNING *;
      `, [id_bouquet, id_item, qty, price, id]);
  
      if (updatedComposition.rows.length === 0) {
        res.status(400).send({ error: 'Composition not found' });
      } else {
        res.status(200).send(updatedComposition.rows[0]);
      }
    } catch (error) {
      res.status(500).send({ error: error.message });
    }
});
  

controller.delete('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const deletedComposition = await db.query(`
        DELETE FROM composition_of_bouquets
        WHERE id = $1
        RETURNING *;
      `, [id]);

        if (deletedComposition.rows.length === 0) {
            res.status(400).send({ error: 'Composition not found' });
        } else {
            res.status(200).send(deletedComposition.rows[0]);
        }
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

export default controller;