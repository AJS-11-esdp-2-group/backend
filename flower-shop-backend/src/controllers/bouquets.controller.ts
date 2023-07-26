import express, { Request, Router, Response } from 'express';
import db from '../db/db';
import BouquetSchema, { Bouquet } from '../models/bouquets.models';
import validate from '../middlewares/validateRequest';

const controller: Router = express.Router();

controller.get('/', async (req: Request, res: Response) => {
    try {
        const bouquets = await db.query(`
          select distinct on(b.id) 
          b.id, b.bouquet_name, b.bouquet_description, i.image, b.author, sum(qty*price) 
          from bouquets b 
          left join (
            SELECT  r.id, r.id_bouquet, r.id_item, r.qty, ipf.price
            FROM recipes r
            LEFT JOIN (
              select item, date,ip.price FROM(
              SELECT item_id as item, max(added_date) as date
              from items_prices
              group by item_id
              ) as fg
              join items_prices ip on fg.date = ip.added_date
            ) as ipf on r.id_item = ipf.item
          ) r on r.id_bouquet = b.id
          LEFT OUTER JOIN bouquets_images i ON b.id = i.id_bouquet
          group by b.id, b.bouquet_name, b.bouquet_description, b.author, i.image
        `);
        
        res.status(200).send(bouquets.rows);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

controller.get('/:id', async (req: Request, res: Response) => {
  try {
      const bouquets = await db.query(`
        select distinct on(b.id) 
        b.id, b.bouquet_name, b.bouquet_description, i.image, b.author, sum(qty*price) 
        from bouquets b 
        left join (
          SELECT  r.id, r.id_bouquet, r.id_item, r.qty, ipf.price
          FROM recipes r
          LEFT JOIN (
            select item, date,ip.price FROM(
            SELECT item_id as item, max(added_date) as date
            from items_prices
            group by item_id
            ) as fg
            join items_prices ip on fg.date = ip.added_date
          ) as ipf on r.id_item = ipf.item
        ) r on r.id_bouquet = b.id
        LEFT OUTER JOIN bouquets_images i ON b.id = i.id_bouquet
        WHERE b.id = $1
        group by b.id, b.bouquet_name, b.bouquet_description, b.author, i.image
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
  
