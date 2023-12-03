import { DataSource } from "typeorm";
import { User } from "./entity/User.js";

const AppDataSource = new DataSource({
  type: "sqlite",
  database: "./Emergency-Net-DB.db",
  entities: [User],
  synchronize: true,
});

AppDataSource.initialize()
  .then(() => {
    console.log("Data Source has been initialized!");
  })
  .catch((err) => {
    console.error("Error during Data Source initialization", err);
  });

export { AppDataSource };
