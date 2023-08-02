import express, { Request, Router, Response } from "express";
import db from "@src/db/db";

const controller: Router = express.Router();

controller.get("/showcase", async (req: Request, res: Response) => {
  try {
    const showcase = await db.query(
      `
      select
      o.bouquet_id as id,
      count(o.bouquet_id),
      o.actual_price,
      (select  bouquet_name from bouquets where id = o.bouquet_id) as "name_bouquet",
      (select image from bouquets_images where id_bouquet = o.bouquet_id limit 1) as "image_bouquet"
      from orders o
      where o.order_number in ( select invoice_number from actions where operation_type_id = 3)
      group by o.bouquet_id, o.actual_price
      `
    );

    res.status(200).send(showcase.rows);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

controller.get("/showcase/:bouquet_id", async (req: Request, res: Response) => {
  try {
    const orderNumber = req.params.bouquet_id;
    const query = `
      select
      r.id_bouquet,
      b.bouquet_name as name_bouquet,
      (select image from bouquets_images where id_bouquet = r.id_bouquet limit 1 )as image_bouquet,
      i.item_name,
      i.price,
      r.qty
      from recipes r
      left join items i on i.id = r.id_item 
      left join bouquets b on b.id = r.id_bouquet
      where r.id_bouquet = $1
      `;

    const result = await db.query(query, [orderNumber]);

    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

controller.put("/:bouquet_id", async (req: Request, res: Response) => {
  try {
    const id = req.params.bouquet_id;
    const token = req.get("Authorization");

    const { total_sum, count } = req.body;

    const user_id = await db.query("SELECT id FROM users WHERE token = $1", [
      token
    ]);
    if (!user_id.rows.length) {
      return res.status(400).send({ message: "User not found" });
    }
    const order = await db.query(
      `select count (o.bouquet_id) from orders o 
      where o.bouquet_id = $1 
      and o.order_number in (select a.invoice_number from actions a where a.operation_type_id =3)`,
      [id]
    );

    if (!order.rows.length || order.rows[0].count < count) {
      return res
        .status(400)
        .send({ error: "Bouquet_not found or quantity more than in the base" });
    }
    const update_date = new Date().toISOString();
    await db.query(
      `UPDATE actions SET operation_type_id = 2, update_date = $1,
      user_id = (SELECT id FROM users WHERE token = $2)
      WHERE
      invoice_number in ( select order_number from orders where bouquet_id = $3 and order_number in
        (select a.invoice_number from actions a where a.operation_type_id = 3) order by order_number limit $4)
      `,
      [update_date, token, id, count]
    );

    await db.query(
      `UPDATE orders
      SET total_sum = $1, update_date = $2, user_id = (SELECT id FROM users WHERE token = $3)
      WHERE bouquet_id in (select bouquet_id from orders where bouquet_id = $4 order by order_number limit $5)`,
      [total_sum, update_date, token, id, count]
    );

    res.status(200).send({ message: "Update was successful" });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

export default controller;
