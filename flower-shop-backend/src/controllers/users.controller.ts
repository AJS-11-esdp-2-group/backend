import express, { Request, Router, Response } from "express";
import db from "@src/db/db";
import UserSchema, { Users } from "@src/models/users.model";
import validate from "@src/middlewares/validateRequest";
import { nanoid } from "nanoid";

const controller: Router = express.Router();

controller.post(
  "/",
  validate(UserSchema),
  async (req: Request, res: Response) => {
    try {
      const {
        username,
        password,
        email,
        phone,
        first_name,
        last_name,
        address,
      } = req.body as Users;

      const user = await db.query("SELECT * FROM users WHERE username = $1", [
        username
      ]);
      const mail = await db.query("SELECT * FROM users WHERE email = $1", [
        email
      ]);

      if (user.rows.length > 0 && mail.rows.length > 0) {
        return res.status(400).send({
          errors: {
            username: "User already exist!",
            email: "E-mail already taken"
          }
        });
      }

      if (user.rows.length > 0) {
        return res.status(400).send({ errors: "User allready exist!" });
      }

      if (mail.rows.length > 0) {
        return res.status(400).send({ errors: "E-mail allready taken" });
      }

      const date = new Date().toISOString();

      const newUser = await db.query(
        `INSERT INTO users
            (username, password, email, email_verificated, phone, first_name, last_name, address, create_date)
            VALUES ($1, crypt($2, gen_salt('bf')), $3, $4, $5, $6, $7, $8, $9)
            RETURNING username, email, phone, first_name, last_name, address, create_date`,
        [
          username,
          password,
          email,
          false,
          phone,
          first_name,
          last_name,
          address,
          date
        ]
      );
      res.status(200).send(newUser.rows[0]);
    } catch (error) {
      res.status(500).send({ error: error.message });
    }
  }
);

controller.post("/login", async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body as Users;

    const user = await db.query("SELECT * FROM users WHERE username = $1", [
      username
    ]);

    if (user.rows.length === 0) {
      return res.status(401).send({ error: "Username not found!" });
    }

    const passwordMatches = await db.query(
      "SELECT crypt($1, $2) = $2 AS password_matches",
      [password, user.rows[0].password]
    );

    if (!passwordMatches.rows[0].password_matches) {
      return res.status(400).send({ errors: "Wrong password" });
    }
    const token = nanoid();
    const userSetToken = await db.query(
      `UPDATE users SET 
                    token = $1
                    WHERE username = $2
                    RETURNING *`,
      [token, username]
    );

    const authorizedUser = await db.query(
      `select
            u.id,
            u.username,
            u.token,
            r.role,
            u.email,
            u.email_verificated,
            u.phone,
            u.avatar,
            u.first_name,
            u.last_name,
            u.address,
            u.create_date,
            u.last_update_date
            from users u
            left join user_roles r on r.id = u.id_role
            where u.username = $1`,
      [username]
    );
    res.status(200).send(authorizedUser.rows[0]);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

controller.delete("/logout", async (req, res) => {
  try {
    const token = req.headers.authorization;
    if (!token) {
      return res.status(401).send({ error: "Unauthorized" });
    }

    const user = await db.query(`SELECT * from users WHERE token = $1`, [
      token
    ]);

    if (user.rowCount === 0) {
      return res.status(200).send({ message: "Logout successfull!" });
    }

    const dropToken = null;
    const resetToken = await db.query(
      `UPDATE users SET 
                    token = $1
                    WHERE token = $2
                    RETURNING *`,
      [dropToken, token]
    );

    res.status(200).send({ message: "Logout successful" });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

export default controller;
