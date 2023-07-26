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
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
const validateRequest_1 = __importDefault(require("@src/middlewares/validateRequest"));
const itemsPrices_1 = __importDefault(require("@src/models/itemsPrices"));
const express_1 = __importDefault(require("express"));
const db_1 = __importDefault(require("@src/db/db"));
const controller = express_1.default.Router();
controller.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const itemsPrices = yield db_1.default.query('SELECT * FROM items_prices');
        res.status(200).send(itemsPrices.rows);
    }
    catch (error) {
        res.status(500).send({ error: error.message });
    }
}));
controller.post('/', (0, validateRequest_1.default)(itemsPrices_1.default), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { item_id, price } = req.body;
        const added_date = new Date().toISOString();
        const newPrice = yield db_1.default.query(`INSERT INTO items_prices (item_id, price, added_date)
         VALUES ($1, $2, $3)
         RETURNING *`, [item_id, price, added_date]);
        res.status(200).send({
            message: 'Price added successfully',
            price: newPrice.rows[0],
        });
    }
    catch (error) {
        res.status(500).send({ error: error.message });
    }
}));
exports.default = controller;
