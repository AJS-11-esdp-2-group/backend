import express, { Request, Router, Response } from 'express';
import db from '@src/db/db';
import UserSchema, { Users } from '@src/models/users.model';
import validate from '@src/middlewares/validateRequest';

const controller: Router = express.Router();

controller.post('/', validate(UserSchema), async (req: Request, res: Response) => {
    try {
        const {
            username,
            password,
            email,
            phone,
            first_name,
            last_name,
            address,
            country,
            city
        } = req.body as Users;

        const user = await db.query('SELECT * FROM users WHERE username = $1', [username]);
        const mail = await db.query('SELECT * FROM users WHERE email = $1', [email]);

        if (user.rows.length > 0 && mail.rows.length > 0) {
            return res.status(400).send({
                errors: { username: 'User allready exist!', email: 'E-mail allready taken' }
            });
        }

        if (user.rows.length > 0) {
            return res.status(400).send({ errors: 'User allready exist!' });
        }

        if (mail.rows.length > 0) {
            return res.status(400).send({ errors: 'E-mail allready taken' });
        }

        const date = new Date().toISOString();

        const newUser = await db.query(
            `INSERT INTO users
            (username, password, email, email_verificated, phone, first_name, last_name, address, id_country, id_city, create_date)
            VALUES ($1, crypt($2, gen_salt('bf')), $3, $4, $5, $6, $7, $8, $9, $10, $11)
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
                country,
                city,
                date
            ]
        );

        res.status(200).send(newUser.rows);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

controller.post('/login', async (req: Request, res: Response) => {
    try {
        const { username, password } = req.body as Users;

        const user = await db.query('SELECT * FROM users WHERE username = $1', [username]);

        if (user.rows.length === 0) {
            return res.status(401).send({ error: 'Invalid username or password' });
        }

        const passwordMatches = await db.query(
            'SELECT crypt($1, $2) = $2 AS password_matches',
            [password, user.rows[0].password]
        );

        if (!passwordMatches.rows[0].password_matches) {
            return res.status(400).send({ errors: 'Invalid username or password' });
        }

        res.status(200).send({ message: 'Login successful' });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

const invalidTokens = new Set();
controller.delete('/logout', async (req, res) => {
    try {
        const token = req.headers.authorization;

        if (!token) {
            return res.status(401).send({ error: 'Unauthorized' });
        }

        invalidTokens.add(token);

        res.status(200).send({ message: 'Logout successful' });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});


export default controller;