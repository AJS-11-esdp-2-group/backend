import express, { Request, Router, Response } from 'express';
import db from '@src/db/db';
import BouquetSchema, { Bouquet } from '@src/models/bouquets.models';
import validate from '@src/middlewares/validateRequest';

const controller: Router = express.Router();

controller.get('/', async (req: Request, res: Response) => {
    try {
        const bouquets = await db.query(`
      SELECT 
        b.id, 
        b.bouquet_name, 
        b.bouquet_description
      FROM bouquets b
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
      RETURNING *
    `, [bouquet_name, bouquet_description]);

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
        return res.status(404).send('Bouquet not found');
      }
  
      res.status(200).send('Bouquet deleted successfully');
    } catch (error) {
      res.status(500).send({ error: error.message });
    }
  });
  
  export default controller;
  
