import express, { Request, Router, Response } from "express";
import db from "../db/db";
import UnderSubcategorySchema, {
  UnderSubcategory
} from "../models/itemsUnderSubcategories.models";
import validate from "../middlewares/validateRequest";

const controller: Router = express.Router();

controller.get("/", async (req: Request, res: Response) => {
  try {
    const subcategory = await db.query(
      `
select
ius.id,
ius.under_subcategory_name,
ius.under_subcategory_description,
its.subcategory_name,
its.subcategory_description,
ic.category_name,
ic.category_description
from items_under_subcategories ius
inner join items_subcategories its on its.id = ius.id_subcategories
inner join items_categories ic on ic.id = its.id_category
order by ius.id`
    );
    res.status(200).send(subcategory.rows);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

controller.get("/:id", async (req: Request, res: Response) => {
  try {
    const subcategoryId = req.params.id;

    const subcategory = await db.query(
      `select
      ius.id,
      ius.under_subcategory_name,
      ius.under_subcategory_description,
      its.subcategory_name,
      its.subcategory_description,
      ic.category_name,
      ic.category_description
      from items_under_subcategories ius
      inner join items_subcategories its on its.id = ius.id_subcategories
      inner join items_categories ic on ic.id = its.id_category
            WHERE ius.id = $1`,
      [subcategoryId]
    );

    if (subcategory.rows.length === 0) {
      return res.status(404).send({ error: "Subcategory not found" });
    }
    res.status(200).send(subcategory.rows[0]);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

controller.post(
  "/",
  validate(UnderSubcategorySchema),
  async (req: Request, res: Response) => {
    try {
      const token = req.get("Authorization");
      const user_id = await db.query("SELECT id FROM users WHERE token = $1", [
        token
      ]);
      if (!user_id.rows.length) {
        return res.status(400).send({ message: "User not found" });
      }
      const {
        under_subcategory_name,
        under_subcategory_description,
        id_subcategories
      } = req.body as UnderSubcategory;
      const subcategory = await db.query(
        "select*from items_subcategories WHERE id = $1",
        [id_subcategories]
      );
      if (!subcategory.rows.length) {
        return res
          .status(400)
          .send({ message: "Subcategories are not in the database" });
      }
      const newSubcategory = await db.query(
        `
      INSERT INTO items_under_subcategories (under_subcategory_name, under_subcategory_description, id_subcategories)
      VALUES ($1, $2, $3)
      RETURNING *
    `,
        [
          under_subcategory_name,
          under_subcategory_description,
          id_subcategories
        ]
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
    const deletedSubcategory = await db.query(
      `
        DELETE FROM items_under_subcategories
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
  validate(UnderSubcategorySchema),
  async (req: Request, res: Response) => {
    try {
      const id = req.params.id;
      const token = req.get("Authorization");
      const {
        under_subcategory_name,
        under_subcategory_description,
        id_subcategories
      } = req.body as UnderSubcategory;
      const user_id = await db.query("SELECT id FROM users WHERE token = $1", [
        token
      ]);
      if (!user_id.rows.length) {
        return res.status(400).send({ message: "User not found" });
      }
      const sub_category = await db.query(
        "select*from items_subcategories where id = $1",
        [id_subcategories]
      );
      if (!sub_category.rows.length) {
        return res.status(400).send({ error: "SubCategory not found" });
      }
      const updateUnderCategory = await db.query(
        `UPDATE items_under_subcategories SET
        under_subcategory_name=$1,
        under_subcategory_description = $2,
        id_subcategories=$3
              WHERE id = $4
              RETURNING *`,
        [
          under_subcategory_name,
          under_subcategory_description,
          id_subcategories,
          id
        ]
      );
      if (updateUnderCategory.rows.length === 0) {
        return res.status(404).send("UnderSubcategory is not found");
      }
      res.status(200).send(updateUnderCategory.rows);
    } catch (error) {
      res.status(500).send({ error: error.message });
    }
  }
);

export default controller;
