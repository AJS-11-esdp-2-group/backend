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
const db_1 = __importDefault(require("@src/db/db"));
const controller = express_1.default.Router();
controller.get("/country", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const country = yield db_1.default.query(`SELECT * FROM countries;`);
        res.status(200).send(country.rows);
    }
    catch (error) {
        res.status(500).send({ error: error.message });
    }
}));
controller.get("/cities", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cities = yield db_1.default.query(`SELECT name_city, countries.name_country FROM cities JOIN countries ON cities.id_country = countries.id;`);
        if (cities.rows.length === 0) {
            return res.status(404).send({ error: 'Cities not found' });
        }
        res.status(200).send(cities.rows);
    }
    catch (error) {
        res.status(500).send({ error: error.message });
    }
}));
exports.default = controller;
