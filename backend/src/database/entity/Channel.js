import { EntitySchema } from "typeorm";

export const Channel = new EntitySchema({
  name: "Channel",
  tableName: "channel",
  columns: {
    channelName: {
      primary: true,
      type: "varchar",
    },
    isActive: {
      type: "boolean",
    },
    channelCert: {
      type: "varchar",
    },
  },
});
