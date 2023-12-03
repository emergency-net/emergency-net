import { EntitySchema } from "typeorm";

module.exports = new EntitySchema({
  name: "User",
  tableName: "user", // Optional: Provide `tableName` property to override the default behaviour for table name.
  columns: {
    username: {
      primary: true,
      type: "varchar",
    },
  },
});
