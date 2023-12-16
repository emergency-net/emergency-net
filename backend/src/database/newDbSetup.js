import { DataSource } from "typeorm";
import { User } from "./entity/User.js";
import { Message } from "./entity/Message.js";
import { Channel } from "./entity/Channel.js";

const AppDataSource = new DataSource({
  type: "sqlite",
  database: "./Emergency-Net-DB.db",
  entities: [User, Message, Channel],
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
