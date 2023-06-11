import express, { Request, Router, Response } from 'express';
import db from '@src/db/db';
import SupplierSchema, {Supplier} from '@src/models/supplier.model';
import validate from '@src/middlewares/validateRequest';

const controller: Router = express.Router();

controller.get('/', async (req: Request, res: Response) => {
    try {
        const suppliers = await db.query(
            `SELECT s.id as id_supplier, 
                s.name as name_supplier, 
                s.contact_person, s.email, 
                s.phone, s.address, 
                s.create_date, 
                s.country as id_country, 
                co.name as name_country, 
                s.city as id_city, 
                c.name as name_city FROM suppliers s 
                INNER JOIN cities c on c.id = s.city  
                INNER JOIN countries co on co.id = s.country`
          );
      
        res.status(200).send(suppliers.rows)
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

controller.get('/:id', async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        const supplier = await db.query(
            `SELECT s.id as id_supplier, 
                s.name as name_supplier, 
                s.contact_person, 
                s.email, s.phone, 
                s.address, 
                s.create_date, 
                s.country as id_country, 
                co.name as name_country, 
                s.city as id_city, 
                c.name as name_city FROM suppliers s 
                INNER JOIN cities c on c.id = s.city  
                INNER JOIN countries co on co.id = s.country 
                WHERE s.id = $1`,
            [id]
          );
      
        if (!supplier.rows.length) {
            return res.status(404).send({ error: 'Supplier not found' });
        }
        res.status(200).send(supplier.rows);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});


controller.put('/:id', validate(SupplierSchema), async (req: Request, res: Response) => {
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
        } = req.body as Supplier;

        const supplier = await db.query('SELECT * FROM suppliers WHERE id = $1', [id]);

        if (!supplier.rows.length) {
            return res.status(400).send({ error: 'Supplier not found' });
        }

        const updatedSupplier = await db.query(
            `UPDATE suppliers SET
            name = $1,
            contact_person = $2,
            email = $3,
            phone = $4,
            address = $5,
            country = $6,
            city = $7
            WHERE id = $8
            RETURNING *`,
            [
                name,
                contact_person,
                email,
                phone,
                address,
                country,
                city,
                id,
            ]
        );

        res.status(200).send(updatedSupplier.rows);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

controller.post('/', validate(SupplierSchema), async (req: Request, res: Response) => {
    try {
        const {
            name,
            contact_person,
            email,
            phone,
            address,
            country,
            city,
        } = req.body as Supplier;

        const create_date = new Date().toISOString();

        const newSupplier = await db.query(
            `INSERT INTO suppliers
            (name, contact_person, email, phone, address, country, city, create_date)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *`,
            [
                name,
                contact_person,
                email,
                phone,
                address,
                country,
                city,
                create_date,
            ]
        );

        res.status(200).send(newSupplier.rows);
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
            return res.status(400).send({ error: 'Supplier not found' });
        }

        await db.query('DELETE FROM suppliers WHERE id = $1', [id]);

        res.status(200).send({ message: 'Supplier deleted successfully' });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

export default controller;