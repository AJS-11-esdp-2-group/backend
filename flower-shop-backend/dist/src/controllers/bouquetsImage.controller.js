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
const upload_1 = __importDefault(require("../middlewares/upload"));
const util_1 = require("util");
const storage_1 = require("@google-cloud/storage");
const db_1 = __importDefault(require("../db/db"));
const config_1 = require("../../config");
const fs_1 = __importDefault(require("fs"));
const nanoid_1 = require("nanoid");
const path_1 = __importDefault(require("path"));
const controller = express_1.default.Router();
const storage = new storage_1.Storage({
    projectId: "rugged-night-391816",
    credentials: require('../../google-cloud-key.json')
});
const bucket = storage.bucket("flower_shop_1");
controller.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const images = yield db_1.default.query(`
        SELECT * FROM bouquets_images
      `);
        res.status(200).send(images.rows);
    }
    catch (error) {
        res.status(500).send({ error: error.message });
    }
}));
controller.post("/", upload_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const imageData = Object.assign({}, req.body);
    try {
        if (!imageData.id_bouquet)
            return res.status(400).send({ message: 'Id of bouquet is required' });
        let publicUrl = '';
        const insertIntoDatabase = () => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const bouquetImage = yield db_1.default.query(`
                INSERT INTO bouquets_images (id_bouquet, image) 
                VALUES ($1, $2)
                RETURNING *
            `, [imageData.id_bouquet, publicUrl]);
                res.sendStatus(200);
            }
            catch (error) {
                res.status(500).send({ error: error.message });
            }
        });
        if (req.file) {
            const blob = bucket.file((0, nanoid_1.nanoid)() + path_1.default.extname(req.file.originalname));
            const blobStream = blob.createWriteStream({
                resumable: false,
            });
            blobStream.on("error", (err) => {
                res.status(500).send({ message: err.message });
            });
            blobStream.on("finish", () => {
                publicUrl = (0, util_1.format)(`https://storage.googleapis.com/${bucket.name}/${blob.name}`);
                insertIntoDatabase();
            });
            blobStream.end(req.file.buffer);
        }
        else {
            insertIntoDatabase();
        }
    }
    catch (error) {
        res.status(500).send({ error: error.message });
    }
}));
controller.get('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const images = yield db_1.default.query(`
            SELECT * FROM bouquets_images b
            WHERE b.id_bouquet = $1
        `, [req.params.id]);
        res.status(200).send(images.rows);
    }
    catch (error) {
        res.status(500).send({ error: error.message });
    }
}));
controller.delete('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const image = yield db_1.default.query(`
            SELECT * FROM bouquets_images b
            WHERE b.id = $1
        `, [req.params.id]);
        if (image.rows.length === 0)
            return res.status(401).send({ error: 'Image not found' });
        yield db_1.default.query(`
            DELETE FROM bouquets_images b
            WHERE b.id = $1
        `, [req.params.id]);
        fs_1.default.unlink((config_1.uploadPath + '/' + image.rows[0].image), (err) => {
            if (err)
                throw err;
        });
        res.status(200).send({ success: 'Image delete success!' });
    }
    catch (error) {
        res.status(500).send({ error: error.message });
    }
}));
exports.default = controller;
