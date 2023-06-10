import express, { Request, Router, Response } from 'express';
import db from '@src/db/db';
import { CreateSupplierDto } from '@src/dto/CreateSupplier.dto';

const controller: Router = express.Router();

controller.get('/', async (req: Request, res: Response) => {
    try {
        const suppliers = await db.query('SELECT * FROM suppliers');
        res.send(suppliers.rows)
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

controller.get('/:id', async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        const supplier = await db.query(
            'SELECT * FROM suppliers WHERE id = $1',
            [id]
        );
        if (!supplier.rows.length) {
            return res.status(404).send({ error: 'Supplier not found' });
        }
        res.send(supplier.rows);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});


controller.put('/:id', async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        const {
            name,
            contact_person,
            email,
            phone,
            address,
            country,
            city,
        } = req.body as CreateSupplierDto;

        const supplier = await db.query(
            'SELECT * FROM suppliers WHERE id = $1',
            [id]
        );

        if (!supplier.rows.length) {
            return res.status(404).send({ error: 'Supplier not found' });
        }

        const updatedSupplier = await db.query(
            `UPDATE suppliers SET 
            name = $1, 
            contact_person = $2, 
            email = $3, 
            phone = $4, 
            address =$5, 
            country = $6, 
            city = $7 
            WHERE id = $8 
            RETURNING *`,
            [name, contact_person, email, phone, address, country, city, id]
        );

        res.send(updatedSupplier.rows);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

controller.post('/', async (req: Request, res: Response) => {
    try {
        const {
            name,
            contact_person,
            email,
            phone,
            address,
            country,
            city
        } = req.body as CreateSupplierDto;
        const create_date = new Date().toISOString();
        const newSupplier = await db.query(
            `INSERT INTO suppliers 
            (name, contact_person, email, phone, address, country, city, create_date) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
            [name, contact_person, email, phone, address, country, city, create_date]);
        res.send(newSupplier.rows);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

controller.delete('/:id', async (req: Request, res: Response) => {
    try {
        const id = req.params.id;

        const supplier = await db.query(
            'SELECT * FROM suppliers WHERE id = $1',
            [id]
        );

        if (!supplier.rows.length) {
            return res.status(404).send({ error: 'Supplier not found' });
        }

        await db.query('DELETE FROM suppliers WHERE id = $1', [id]);

        res.send({ message: 'Supplier deleted successfully' });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

export default controller;