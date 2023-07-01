import express, { Request, Router, Response } from 'express';
import db from '@src/db/db';
import CompositionBouquetsSchema,
{ CompositionBouquets } from '@src/models/compositionBouquets';
import validate from '@src/middlewares/validateRequest';

const controller: Router = express.Router();

controller.get('/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const composition = await db.query(`
        SELECT 
          c.id,
          c.id_bouquet,
          i.item_name,
          i.image_large,
          c.qty
        FROM
          composition_of_bouquets c
          JOIN items i ON i.id = c.id_item
        WHERE c.id_bouquet = $1;
      `, [id]);
  
      res.status(200).send(composition.rows);
    } catch (error) {
      res.status(500).send({ error: error.message });
    }
});
  

controller.post('/', validate(CompositionBouquetsSchema), async (req: Request, res: Response) => {
    try {
        const { id_bouquet, id_item, qty } = req.body as CompositionBouquets;

        const newComposition = await db.query(`
        INSERT INTO composition_of_bouquets (id_bouquet, id_item, qty)
        VALUES ($1, $2, $3)
        RETURNING *
      `, [id_bouquet, id_item, qty]);
      
      const composition = await db.query(`
          SELECT 
          c.id,
          c.id_bouquet,
          i.item_name,
          i.image_large,
          c.qty
        FROM
          composition_of_bouquets c
          JOIN items i ON i.id = c.id_item
        WHERE c.id = $1;
      `, [(newComposition.rows[0]).id]);

        res.status(200).send(composition.rows);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

controller.put('/:id', validate(CompositionBouquetsSchema), async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { id_bouquet, id_item, qty} = req.body as CompositionBouquets;

      const composition = await db.query(`
        SELECT * FROM composition_of_bouquets WHERE id = $1
      `, [id]);
      
      if(composition.rows.length === 0) res.status(401).send({error: 'Composition not found'});
  
      const updatedComposition = await db.query(`
        UPDATE composition_of_bouquets
        SET id_bouquet = $1, id_item = $2, qty = $3
        WHERE id = $4
        RETURNING *;
      `, [id_bouquet, id_item, qty, id]);

      const newComposition = await db.query(`
          SELECT 
          c.id,
          c.id_bouquet,
          i.item_name,
          i.image_large,
          c.qty
        FROM
          composition_of_bouquets c
          JOIN items i ON i.id = c.id_item
        WHERE c.id = $1;
      `, [(updatedComposition.rows[0]).id]
      );
  
      res.status(200).send(newComposition.rows);
    } catch (error) {
      res.status(500).send({ error: error.message });
    }
});
  

controller.delete('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const composition = await db.query(`
        SELECT * FROM composition_of_bouquets WHERE id = $1
      `, [id]);
      
      if(composition.rows.length === 0) res.status(401).send({error: 'Composition not found'});

      const deletedComposition = await db.query(`
        DELETE FROM composition_of_bouquets
        WHERE id = $1
        RETURNING *;
      `, [id]);

      res.status(200).send(deletedComposition.rows[0]);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

export default controller;