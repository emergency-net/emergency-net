import { EntitySchema } from "typeorm";

export const Message = new EntitySchema({
  name: "Message",
  tableName: "message",
  columns: {
    content: {
      type: "varchar",
    },
    channel: {
      type: "varchar",
    },
    tod: {
      type: "date",
    },
    usernick: {
      type: "varchar",
    },
    origin: {
      type: "varchar",
    },
    certificate: {
      type: "varchar",
    },
    hashKey: {
      primary: true,
      type: "varchar",
    },
    isSafe: {
      type: "boolean",
    },
  },
});
