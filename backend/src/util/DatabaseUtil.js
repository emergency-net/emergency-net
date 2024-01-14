import { BlacklistedPU } from "../database/entity/BlacklistedPU.js";
import { User } from "../database/entity/User.js";
import { AppDataSource } from "../database/newDbSetup.js";
import dotenv from "dotenv";
import fs from "fs";
import { createMessageCert } from "./MessageUtil.js";
dotenv.config();

export async function putUser(user) {
  return await AppDataSource.createQueryBuilder()
    .insert()
    .into(User)
    .values(user)
    .execute();
}

export async function getUser(username) {
  return await AppDataSource.createQueryBuilder()
    .select()
    .from(User, "user")
    .where("user.username = :username", { username })
    .getOne();
}

export async function fillBlacklist() {
  let blacklist = fs.readFileSync(process.env.BLACKLIST_PATH).toString();

  for (let nickname of blacklist.split("\n")) {
    if (nickname) {
      if (
        await AppDataSource.manager.findOneBy(BlacklistedPU, {
          puNickname: nickname,
        })
      ) {
        console.log("PU already blacklisted.");
        continue;
      }
      const puInfo = {
        puNickname: nickname,
      };

      await AppDataSource.manager
        .save(BlacklistedPU, {
          puNickname: nickname,
          cert: createMessageCert(puInfo),
        })
        .then(() => console.log("Blacklisted PU saved to the database."));
    }
  }
}

export async function getBlacklist() {
  return await AppDataSource.getRepository(BlacklistedPU).find();
}

export async function getBlacklistAsArray() {
  const nicknames = await AppDataSource.getRepository(BlacklistedPU).find({
    select: ["puNickname"],
  });

  return nicknames.map((entry) => entry.puNickname);
}
