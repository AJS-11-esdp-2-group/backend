import express, { Request, Router, Response } from "express";
import nextOrderNumbers from "@src/helpers/nextOrderNumber";
import db from "@src/db/db";

const controller: Router = express.Router();

controller.get("/showcase", async (req: Request, res: Response) => {
  try {
    const showcase = await db.query(
      `
    select
    o.order_number as id,
    o.actual_price,
    (select  bouquet_name from bouquets where id = o.bouquet_id) as "name_bouquet",
    (select image from bouquets_images where id_bouquet = o.bouquet_id limit 1) as "image_bouquet",
    o.added_date
    from orders o
    where o.order_number in ( select invoice_number from actions where operation_type_id = 3)
      `
    );

    res.status(200).send(showcase.rows);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

controller.get(
  "/showcase/:order_number",
  async (req: Request, res: Response) => {
    try {
      const orderNumber = req.params.order_number;
      const query = `
      select
      o.order_number,
      (select  bouquet_name from bouquets where id = o.bouquet_id) as "name_bouquet",
      (select image from bouquets_images where id_bouquet = o.bouquet_id limit 1) as "image_bouquet",
      a.price,
      a.qty,
      i.item_name
      from 
      orders o
      inner join actions a on a.invoice_number = o.order_number
      inner join items i on i.id =  a.item_id
      where o.order_number = $1;
      `;

      const result = await db.query(query, [orderNumber]);

      res.status(200).json(result.rows);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

controller.post("/showcase", async (req: Request, res: Response) => {
  const token = req.get('Authorization');

  if(!token) return res.status(400).send('Token must present!');

  try {
    const user = await db.query('SELECT * FROM users WHERE token = $1', [token]);
    if (!user.rows.length) {
      return res.status(400).send({ message: 'User not found' });
    }
    const {bouquets} = req.body as {bouquets: Array<string>};
    
    if(!bouquets || !bouquets.length) return res.status(400).send({message:'Bad request'});
    
    const newOrderNumbers = await nextOrderNumbers(bouquets.length);
    
    const actions = bouquets.map(async(bouquet, i) => {
      const create_date = new Date().toISOString();
      
      const price = await db.query(`
        select distinct on(b.id) 
        b.id, sum(qty*price) 
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
        WHERE b.id = $1
        group by b.id
    `, [parseInt(bouquet)]);
    
      return db.query(`
        INSERT INTO orders (order_number, bouquet_id, actual_price, total_sum, added_date, update_date, user_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`, 
        [newOrderNumbers[i], bouquet, 
        price.rows[0].sum === null? 0: parseInt(price.rows[0].sum), 
        price.rows[0].sum === null? 0: parseInt(price.rows[0].sum), 
        create_date, null, user.rows[0].id]);
    });
    
    const results = await Promise.all(actions);
    res.status(200).send(results.map((result) => result.rows[0]));
    
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

controller.put("/:order_number", async (req: Request, res: Response) => {
  try {
    const id = req.params.order_number;
    const token = req.get("Authorization");

    const { total_sum } = req.body;

    const user_id = await db.query("SELECT id FROM users WHERE token = $1", [
      token
    ]);
    if (!user_id.rows.length) {
      return res.status(400).send({ message: "User not found" });
    }
    const order = await db.query(
      "SELECT * FROM orders WHERE order_number = $1",
      [id]
    );

    if (!order.rows.length) {
      return res.status(400).send({ error: "Order_number not found" });
    }
    const update_date = new Date().toISOString();
    await db.query(
      "UPDATE actions SET operation_type_id = 2, update_date = $1, user_id = (SELECT id FROM users WHERE token = $2) WHERE invoice_number = $3",
      [update_date, token, id]
    );

    await db.query(
      `UPDATE orders
        SET total_sum = $1, update_date = $2, user_id = (SELECT id FROM users WHERE token = $3)
        WHERE order_number = $4`,
      [total_sum, update_date, token, id]
    );

    res.status(200).send({ message: "Update was successful" });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

export default controller;
