import { DataSource } from "typeorm";

const AppDataSource = new DataSource({
  type: "sqlite",
  database: "./Emergency-Net-DB.db",
});

AppDataSource.initialize()
  .then(() => {
    console.log("Data Source has been initialized!");
  })
  .catch((err) => {
    console.error("Error during Data Source initialization", err);
  });

export { AppDataSource };
