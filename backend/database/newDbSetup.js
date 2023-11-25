import { DataSource } from "typeorm";
import { User } from "./entities/User.js"

const AppDataSource = new DataSource({
    type: "sqlite3",
    host: "localhost",
    port: 3306,
    username: "test",
    password: "test",
    database: "test",
    entity: []
})

AppDataSource.initialize()
    .then(() => {
        console.log("Data Source has been initialized!")
    })
    .catch((err) => {
        console.error("Error during Data Source initialization", err)
    })

export default AppDataSource;