"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const db_1 = __importDefault(require("../db/db"));
const supplier_model_1 = __importDefault(require("../models/supplier.model"));
const validateRequest_1 = __importDefault(require("../middlewares/validateRequest"));
const controller = express_1.default.Router();
controller.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const suppliers = yield db_1.default.query(`select
      s.id,
      s.name_supplier,
      s.email,
      s.phone,
      s.address,
      s.comment
      from suppliers s
order by s.name_supplier`);
        res.status(200).send(suppliers.rows);
    }
    catch (error) {
        res.status(500).send({ error: error.message });
    }
}));
controller.get("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const supplier = yield db_1.default.query(`select
      s.id,
      s.name_supplier,
      s.email,
      s.phone,
      s.address,
      s.comment
      from suppliers s
      WHERE s.id = $1`, [id]);
        if (!supplier.rows.length) {
            return res.status(404).send({ error: "Supplier not found" });
        }
        res.status(200).send(supplier.rows);
    }
    catch (error) {
        res.status(500).send({ error: error.message });
    }
}));
controller.put("/:id", (0, validateRequest_1.default)(supplier_model_1.default), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const { name_supplier, email, phone, address, comment } = req.body;
        const supplier = yield db_1.default.query("SELECT * FROM suppliers WHERE id = $1", [
            id
        ]);
        if (!supplier.rows.length) {
            return res.status(400).send({ error: "Supplier not found" });
        }
        const updatedSupplier = yield db_1.default.query(`UPDATE suppliers SET
            name_supplier = $1,
            email = $2,
            phone = $3,
            address = $4,
            comment = $5
            WHERE id= $6
            RETURNING *`, [
            name_supplier,
            email,
            phone,
            address,
            comment,
            id
        ]);
        const selectedSupplier = yield db_1.default.query(`select
        s.id,
        s.name_supplier,
        s.email,
        s.phone,
        s.address,
        s.comment
        from suppliers s
        WHERE s.id = $1`, [id]);
        res.status(200).send(selectedSupplier.rows);
    }
    catch (error) {
        res.status(500).send({ error: error.message });
    }
}));
controller.post("/", (0, validateRequest_1.default)(supplier_model_1.default), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name_supplier, email, phone, address, comment } = req.body;
        const create_date = new Date().toISOString();
        const newSupplier = yield db_1.default.query(`INSERT INTO suppliers as s
            (name_supplier, email, phone, address, comment)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id`, [
            name_supplier,
            email,
            phone,
            address,
            comment
        ]);
        const supplier = yield db_1.default.query(`select
        s.id,
        s.name_supplier,
        s.email,
        s.phone,
        s.address,
        s.comment
        from suppliers s
        WHERE s.id = $1`, [newSupplier.rows[0].id]);
        res.status(200).send(supplier.rows);
    }
    catch (error) {
        res.status(500).send({ error: error.message });
    }
}));
controller.delete("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const supplierInActions = yield db_1.default.query("SELECT * FROM actions WHERE source_id IN (SELECT id FROM suppliers_storages WHERE supplier_id = $1) OR target_id IN (SELECT id FROM storages WHERE id IN (SELECT storage_id FROM suppliers_storages WHERE supplier_id = $1))", [id]);
        if (supplierInActions.rows.length > 0) {
            return res.status(400).send({ error: "Supplier is associated with actions and cannot be deleted" });
        }
        const supplier = yield db_1.default.query("SELECT * FROM suppliers WHERE id = $1", [
            id
        ]);
        if (!supplier.rows.length) {
            return res.status(400).send({ error: "Supplier not found" });
        }
        yield db_1.default.query("DELETE FROM suppliers WHERE id = $1", [id]);
        res.status(200).send({ message: "Supplier deleted successfully" });
    }
    catch (error) {
        res.status(500).send({ error: error.message });
    }
}));
exports.default = controller;
