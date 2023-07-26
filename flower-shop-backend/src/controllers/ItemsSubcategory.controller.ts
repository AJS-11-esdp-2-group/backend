import express, { Request, Router, Response } from "express";
import db from "../db/db";
import SubcategorySchema, { Subcategory } from "../models/subcategory.models";
import validate from "../middlewares/validateRequest";

const controller: Router = express.Router();
controller.get("/", async (req: Request, res: Response) => {
  try {
    const category = req.query.id_category;
    if (category) {
      const subcategory = await db.query(
        `SELECT
        sc.id,
        sc.subcategory_name,
        sc.subcategory_description,
        c.category_name
        FROM items_subcategories sc
        inner join items_categories c on c.id = sc.id_category
        WHERE sc.id_category = $1`,
        [category]
      );
      res.status(200).send(subcategory.rows);
    } else {
      const subcategory = await db.query(
        `SELECT
          sc.id,
          sc.subcategory_name,
          sc.subcategory_description,
          c.category_name
          FROM items_subcategories sc
          inner join items_categories c on c.id = sc.id_category
          order by sc.id`
      );
      res.status(200).send(subcategory.rows);
    }
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});
controller.get("/:id", async (req: Request, res: Response) => {
  try {
    const subcategoryId = req.params.id;
    const subcategory = await db.query(
      `     SELECT
            sc.id,
            sc.subcategory_name,
            sc.subcategory_description,
            c.category_name
            FROM items_subcategories sc
            inner join items_categories c on c.id = sc.id_category
            WHERE sc.id = $1`,
      [subcategoryId]
    );
    if (subcategory.rows.length === 0) {
      return res.status(404).send({ error: "Subcategory not found" });
    }
    res.status(200).send(subcategory.rows);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

controller.post(
  "/",
  validate(SubcategorySchema),
  async (req: Request, res: Response) => {
    try {
      const token = req.get("Authorization");
      const user_id = await db.query("SELECT id FROM users WHERE token = $1", [
        token
      ]);
      if (!user_id.rows.length) {
        return res.status(400).send({ message: "User not found" });
      }
      const { subcategory_name, subcategory_description, id_category } =
        req.body as Subcategory;
      const category = await db.query(
        "select*from items_categories WHERE id = $1",
        [id_category]
      );
      if (!category.rows.length) {
        return res
          .status(400)
          .send({ message: "Categories are not in the database" });
      }
      const newSubcategory = await db.query(
        `
      INSERT INTO items_subcategories (subcategory_name, subcategory_description, id_category)
      VALUES ($1, $2, $3)
      RETURNING *
    `,
        [subcategory_name, subcategory_description, id_category]
      );

      res.status(200).send(newSubcategory.rows[0]);
    } catch (error) {
      res.status(500).send({ error: error.message });
    }
  }
);

controller.delete("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const token = req.get("Authorization");
    const user_id = await db.query("SELECT id FROM users WHERE token = $1", [
      token
    ]);
    if (!user_id.rows.length) {
      return res.status(400).send({ message: "User not found" });
    }
    const sub_category = await db.query(
      "select*from items_subcategories WHERE id = $1",
      [id]
    );
    if (!sub_category.rows.length) {
      return res
        .status(400)
        .send({ message: "Subcategories are not in the database" });
    }
    const dependent_subcategory = await db.query(
      "select*from items_under_subcategories WHERE id_subcategories = $1",
      [id]
    );
    if (dependent_subcategory.rows.length) {
      return res.status(400).send({
        message:
          "Subcategories have associated records in the table items_under_subcategories"
      });
    }

    const deletedSubcategory = await db.query(
      `
        DELETE FROM items_subcategories
        WHERE id = $1
        RETURNING *
      `,
      [id]
    );

    if (deletedSubcategory.rows.length === 0) {
      return res.status(404).send("Subcategory is not found");
    }
    res.status(200).send("Subcategory is successfully deleted");
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

controller.put(
  "/:id",
  validate(SubcategorySchema),
  async (req: Request, res: Response) => {
    try {
      const id = req.params.id;
      const token = req.get("Authorization");
      const { subcategory_name, subcategory_description, id_category } =
        req.body as Subcategory;
      const user_id = await db.query("SELECT id FROM users WHERE token = $1", [
        token
      ]);
      if (!user_id.rows.length) {
        return res.status(400).send({ message: "User not found" });
      }
      const sub_category = await db.query(
        "select*from items_categories where id = $1",
        [id_category]
      );
      if (!sub_category.rows.length) {
        return res.status(400).send({ error: "Category not found" });
      }
      const updateCategory = await db.query(
        `UPDATE items_subcategories SET
        subcategory_name=$1, 
        subcategory_description = $2,
              id_category=$3
              WHERE id = $4
              RETURNING *`,
        [subcategory_name, subcategory_description, id_category, id]
      );
      if (updateCategory.rows.length === 0) {
        return res.status(404).send("Subcategory is not found");
      }
      res.status(200).send(updateCategory.rows);
    } catch (error) {
      res.status(500).send({ error: error.message });
    }
  }
);

export default controller;