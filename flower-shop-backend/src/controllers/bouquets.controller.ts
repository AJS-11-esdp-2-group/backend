import express, { Request, Router, Response } from 'express';
import db from '@src/db/db';
import BouquetSchema, { Bouquet } from '@src/models/bouquets.models';
import validate from '@src/middlewares/validateRequest';

const controller: Router = express.Router();

controller.get('/', async (req: Request, res: Response) => {
    try {
        const bouquets = await db.query(`
        SELECT DISTINCT ON (b.id)
          b.id, b.bouquet_name, b.bouquet_description, b.author, b.id_category, i.image
        FROM bouquets b
        LEFT OUTER JOIN bouquets_images i ON b.id = i.id_bouquet
        `);
        
        res.status(200).send(bouquets.rows);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

controller.get('/:id', async (req: Request, res: Response) => {
  try {
      const bouquets = await db.query(`
        SELECT DISTINCT ON (b.id)
            b.id, b.bouquet_name, b.bouquet_description, b.author, b.id_category, i.image
        FROM bouquets b
        LEFT OUTER JOIN bouquets_images i ON b.id = i.id_bouquet
        WHERE b.id = $1
      `, [req.params.id]);

      res.status(200).send(bouquets.rows);
  } catch (error) {
      res.status(500).send({ error: error.message });
  }
});

controller.post('/', validate(BouquetSchema), async (req: Request, res: Response) => {
  const token = req.get("Authorization");
  
  try {
    const user = await db.query(`
      SELECT u.first_name, u.last_name  FROM users u
      WHERE token = $1
    `, [token]);

    const author = user.rows.length > 0 ? `${user.rows[0].first_name} ${user.rows[0].last_name}` : 'unknown'; 
    const { bouquet_name, bouquet_description, id_category } = req.body as Bouquet;
    const newBouquet = await db.query(`
      INSERT INTO bouquets (bouquet_name, bouquet_description, author, id_category)
      VALUES ($1, $2, $3, $4)
      RETURNING id, bouquet_name, bouquet_description
    `, [bouquet_name, bouquet_description, author, id_category]);

    res.status(200).send(newBouquet.rows);
  } catch (error) {
      res.status(500).send({ error: error.message });
  }
});

controller.put('/:id', validate(BouquetSchema), async (req: Request, res: Response) => {
  const token = req.get("Authorization");

  try {
    const user = await db.query(`
      SELECT u.first_name, u.last_name  FROM users u
      WHERE token = $1
    `, [token]);

    const author = user.rows.length > 0 ? `${user.rows[0].first_name} ${user.rows[0].last_name}` : 'unknown'; 
    const {id} = req.params;
    const { bouquet_name, bouquet_description, id_category } = req.body as Bouquet;

    const newBouquet = await db.query(`
      UPDATE bouquets SET
      bouquet_name = $1,
      bouquet_description = $2,
      author = $3,
      id_category = $4
      WHERE id = $5
      RETURNING id, bouquet_name, bouquet_description, author, id_category
    `, [bouquet_name, bouquet_description, author, id_category, id]);

        res.status(200).send(newBouquet.rows);
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
  
      res.status(200).send({success: 'Success'});
    } catch (error) {
      res.status(500).send({ error: error.message });
    }
  });
  
export default controller;
  
