import express, { Request, Router, Response } from 'express';
import db from '@src/db/db';
import RecipeSchema,
{ Recipe } from '@src/models/recipe.models';
import validate from '@src/middlewares/validateRequest';

const controller: Router = express.Router();

controller.get('/', async (req: Request, res: Response) => {
  try {

    const recipe = await db.query(`
      SELECT 
        c.id,
        b.bouquet_name,
        i.item_name,
        i.image_large,
        c.qty
      FROM
        recipes c
        JOIN bouquets b ON b.id = c.id_bouquet
        JOIN items i ON i.id = c.id_item`);

    res.status(200).send(recipe.rows);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

controller.get('/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const recipe = await db.query(`
        SELECT 
          c.id,
          c.id_bouquet,
          i.item_name,
          i.image_large,
          c.qty
        FROM
          recipes c
          JOIN items i ON i.id = c.id_item
        WHERE c.id_bouquet = $1;
      `, [id]);
  
      res.status(200).send(recipe.rows);
    } catch (error) {
      res.status(500).send({ error: error.message });
    }
});
  

controller.post('/', validate(RecipeSchema), async (req: Request, res: Response) => {
    try {
        const { id_bouquet, id_item, qty } = req.body as Recipe;

        const newRecipe = await db.query(`
        INSERT INTO recipes (id_bouquet, id_item, qty)
        VALUES ($1, $2, $3)
        RETURNING *
      `, [id_bouquet, id_item, qty]);
      
      const recipe = await db.query(`
          SELECT 
          c.id,
          c.id_bouquet,
          i.item_name,
          i.image_large,
          c.qty
        FROM
        recipes c
          JOIN items i ON i.id = c.id_item
        WHERE c.id = $1;
      `, [(newRecipe.rows[0]).id]);

        res.status(200).send(recipe.rows);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

controller.put('/:id', validate(RecipeSchema), async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { id_bouquet, id_item, qty} = req.body as Recipe;

      const recipe = await db.query(`
        SELECT * FROM recipes WHERE id = $1
      `, [id]);
      
      if(recipe.rows.length === 0) res.status(401).send({error: 'Recipe not found'});
  
      const updatedRecipe = await db.query(`
        UPDATE recipes
        SET id_bouquet = $1, id_item = $2, qty = $3
        WHERE id = $4
        RETURNING *;
      `, [id_bouquet, id_item, qty, id]);

      const newRecipe = await db.query(`
          SELECT 
          c.id,
          c.id_bouquet,
          i.item_name,
          i.image_large,
          c.qty
        FROM
        recipes c
          JOIN items i ON i.id = c.id_item
        WHERE c.id = $1;
      `, [(updatedRecipe.rows[0]).id]
      );
  
      res.status(200).send(newRecipe.rows);
    } catch (error) {
      res.status(500).send({ error: error.message });
    }
});
  

controller.delete('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const recipe = await db.query(`
        SELECT * FROM recipes WHERE id = $1
      `, [id]);
      
      if(recipe.rows.length === 0) res.status(401).send({error: 'Recipe not found'});

      const deletedRecipe = await db.query(`
        DELETE FROM recipes
        WHERE id = $1
        RETURNING *;
      `, [id]);

      res.status(200).send(deletedRecipe.rows[0]);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

export default controller;