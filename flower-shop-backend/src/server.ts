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
import bouquetController from "@src/controllers/bouquets.controller";
import recipesController from "@src/controllers/recipes.controller";
import bouquetsImageController from "./controllers/bouquetsImage.controller";
import itemsPricesControllers from '@src/controllers/itemsPrices.controller';
import saleControllers from '@src/controllers/sale.controller';

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
app.use("/bouquets", bouquetController);
app.use("/recipes", recipesController);
app.use("/bouquets_images", bouquetsImageController);
app.use("/items_prices", itemsPricesControllers);
app.use("/sales", saleControllers);

run().catch(logger.err);