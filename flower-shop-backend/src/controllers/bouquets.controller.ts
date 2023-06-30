import express, { Request, Router, Response } from 'express';
import db from '@src/db/db';
import BouquetSchema, { Bouquet } from '@src/models/bouquets.models';
import validate from '@src/middlewares/validateRequest';

const controller: Router = express.Router();

controller.get('/', async (req: Request, res: Response) => {
    try {
        const bouquets = await db.query(`
      SELECT b.id, b.bouquet_name, b.bouquet_description, i.image
      FROM bouquets b
      JOIN bouquets_images i ON i.id_bouquet = b.id
    `);
        res.status(200).send(bouquets.rows);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

controller.post('/', validate(BouquetSchema), async (req: Request, res: Response) => {
    try {
        const { bouquet_name, bouquet_description } = req.body as Bouquet;
        const newBouquet = await db.query(`
      INSERT INTO bouquets (bouquet_name, bouquet_description)
      VALUES ($1, $2)
      RETURNING id, bouquet_name, bouquet_description
    `, [bouquet_name, bouquet_description]);

        res.status(200).send(newBouquet.rows[0]);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

controller.put('/:id', validate(BouquetSchema), async (req: Request, res: Response) => {
  try {
    const {id} = req.params;
    const { bouquet_name, bouquet_description } = req.body as Bouquet;

    const newBouquet = await db.query(`
      UPDATE bouquets SET
      bouquet_name = $1,
      bouquet_description = $2
      WHERE id = $3
      RETURNING id, bouquet_name, bouquet_description
    `, [bouquet_name, bouquet_description, id]);

        res.status(200).send(newBouquet.rows[0]);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

controller.delete('/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const deletedBouquet = await db.query(`
        DELETE FROM bouquets
        WHERE id = $1
        RETURNING *
      `, [id]);
  
      if (deletedBouquet.rows.length === 0) {
        return res.status(404).send({error: 'Bouquet not found'});
      }
  
      res.status(200).send({success: 'Bouquet not found'});
    } catch (error) {
      res.status(500).send({ error: error.message });
    }
  });
  
  export default controller;
  
