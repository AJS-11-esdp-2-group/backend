import express, { Request, Router, Response } from "express";
import db from "@src/db/db";
import CategorySchema, { Category } from "@src/models/category.models";
import validate from "@src/middlewares/validateRequest";

const controller: Router = express.Router();

controller.get("/", async (req: Request, res: Response) => {
  try {
    const category = await db.query(
      `select * from items_categories order by id`
    );
    res.status(200).send(category.rows);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

controller.get("/:id", async (req: Request, res: Response) => {
  try {
    const categoryId = req.params.id;

    const category = await db.query(
      `SELECT * FROM items_categories WHERE id = $1`,
      [categoryId]
    );

    if (category.rows.length === 0) {
      return res.status(404).send({ error: "Category not found" });
    }

    res.status(200).send(category.rows[0]);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

controller.post(
  "/",
  validate(CategorySchema),
  async (req: Request, res: Response) => {
    try {
      const token = req.get("Authorization");
      const user_id = await db.query("SELECT id FROM users WHERE token = $1", [
        token
      ]);
      if (!user_id.rows.length) {
        return res.status(400).send({ message: "User not found" });
      }
      const { category_name, category_description } = req.body as Category;

      const category = await db.query(
        "select*from items_categories where category_name = $1",
        [category_name]
      );
      if (category.rows.length) {
        return res
          .status(400)
          .send({ message: "Category is already in the database" });
      }
      const newCategory = await db.query(
        `
      INSERT INTO items_categories (category_name, category_description)
      VALUES ($1, $2)
      RETURNING *
    `,
        [category_name, category_description]
      );
      res.status(200).send(newCategory.rows[0]);
    } catch (error) {
      res.status(500).send({ error: error.message });
    }
  }
);

controller.delete("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const id_category = await db.query(
      `
        select*from items_subcategories where id_category = $1`,
      [id]
    );
    if (id_category.rows.length) {
      return res
        .status(400)
        .send({ message: "Category has associated categories" });
    }
    const deletedCategory = await db.query(
      `
        DELETE FROM items_categories
        WHERE id = $1
        RETURNING *
      `,
      [id]
    );
    if (deletedCategory.rows.length === 0) {
      return res.status(404).send("Category is not found");
    }
    res.status(200).send("Category is successfully deleted");
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

controller.put(
  "/:id",
  validate(CategorySchema),
  async (req: Request, res: Response) => {
    try {
      const id = req.params.id;
      const token = req.get("Authorization");
      const { category_name, category_description } = req.body as Category;
      const user_id = await db.query("SELECT id FROM users WHERE token = $1", [
        token
      ]);
      if (!user_id.rows.length) {
        return res.status(400).send({ message: "User not found" });
      }
      const id_category = await db.query(
        "select*from items_categories where id = $1",
        [id]
      );
      if (!id_category.rows.length) {
        return res.status(400).send({ error: "Category not found" });
      }
      const updateCategory = await db.query(
        `UPDATE items_categories SET
              category_name=$1, 
              category_description = $2
              WHERE id = $3
              RETURNING *`,
        [category_name, category_description, id]
      );
      res.status(200).send(updateCategory.rows);
    } catch (error) {
      res.status(500).send({ error: error.message });
    }
  }
);
export default controller;
