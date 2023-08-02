import express, { Request, Router, Response } from "express";
import nextOrderNumbers from "@src/helpers/nextOrderNumber";
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

controller.post("/showcase", async (req: Request, res: Response) => {
  const token = req.get('Authorization');

  if(!token) return res.status(400).send('Token must present!');
  
  try {
    const user = await db.query('SELECT * FROM users WHERE token = $1', [token]);
    
    if (!user.rows.length) return res.status(400).send({ message: 'User not found' });
    
    if(user.rows[0].id_role !== 1 && 2) return res.status(403).send({message: 'Access forbidden'})
    
    const {bouquets} = req.body as {bouquets: Array<string>};
    
    if(!bouquets || !bouquets.length) return res.status(400).send({message:'Bad request'});
    
    const newOrderNumbers = await nextOrderNumbers(bouquets.length);
    
    const actions = bouquets.map(async(bouquet, i) => {
      const create_date = new Date().toISOString();

      const bouquetRecipes = (await db.query(`
      select r.id, r.id_bouquet, r.id_item, r.qty, ipm.price
      from recipes r
      join (
        select il.item_id, il.last_date, ip.price
        from(
          select item_id, max(added_date) as last_date
          from items_prices 
          group by item_id
        )il
        join items_prices ip on ip.added_date = il.last_date
      ) ipm on r.id_item = ipm.item_id
      where id_bouquet in (${bouquet})
      `)).rows;
      
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

    if(bouquetRecipes.length) {
      bouquetRecipes.forEach(async(recipe) => {
        await db.query(`
          INSERT INTO actions (operation_type_id, source_id, target_id, item_id, qty, price, total_price, invoice_number, date, update_date, user_id)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        `, [3, 2, 4, recipe.id_item, 
          parseInt(recipe.qty), parseInt(recipe.price), 
          (parseInt(recipe.qty)*parseInt(recipe.price)), 
          newOrderNumbers[i],create_date, null, user.rows[0].id]);
      });
    }
    
      return db.query(`
        INSERT INTO orders (order_number, bouquet_id, actual_price, total_sum, added_date, update_date, user_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`, 
        [newOrderNumbers[i], bouquet, 
        price.rows[0].sum === null? 0: parseInt(price.rows[0].sum), 
        0, 
        create_date, null, user.rows[0].id]);
    });
    
    const results = await Promise.all(actions);
    res.status(200).send(results.map((result) => result.rows[0]));
    
  } catch (error) {
    res.status(500).send({ error: error.message });
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
