import cors from "cors";
import express from "express";
import logger from "jet-logger";
import itemController from "@src/controllers/items.controller";
import suppliersController from "@src/controllers/suppliers.controller";
import usersController from "@src/controllers/users.controller";
import actionsController from "@src/controllers/actions.controller";
import suppliersStoragesController from '@src/controllers/suppliersStorages.controller'
import storagesController from '@src/controllers/storages.controller'
import itemsCategoryController from "@src/controllers/ItemsCategory.controller";
import itemsSubcategoryController from "@src/controllers/ItemsSubcategory.controller";
import locationController from "@src/controllers/location.controller";

const run = async () => {
  app.listen(PORT, () => {
    logger.info(`Server is running on http://localhost:${PORT}`);
  });
};

const app = express();
const PORT = 8000;

app.use(express.json());
app.use(express.static("public"));
app.use(cors());

app.use("/items", itemController);
app.use("/suppliers", suppliersController);
app.use("/users", usersController);
app.use("/supply", actionsController);
app.use("/suppliers_controllers", suppliersStoragesController);
app.use("/storages", storagesController);
app.use("/items_category", itemsCategoryController);
app.use("/items_subcategory", itemsSubcategoryController);
app.use("/location", locationController);


run().catch(logger.err);