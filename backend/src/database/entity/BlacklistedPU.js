import { EntitySchema } from "typeorm";

export const BlacklistedPU = new EntitySchema({
  name: "BlacklistedPU",
  tableName: "blacklistedPU",
  columns: {
    puNickname: {
      primary: true,
      type: "varchar",
    },
    cert: {
      type: "varchar",
    },
  },
});
