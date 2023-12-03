import { EntitySchema } from "typeorm";

export const User = new EntitySchema({
  name: "User",
  tableName: "user", // Optional: Provide `tableName` property to override the default behaviour for table name.
  columns: {
    username: {
      primary: true,
      type: "varchar",
    },
  },
});

