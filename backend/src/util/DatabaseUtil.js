import { User } from "../database/entity/User.js";
import { AppDataSource } from "../database/newDbSetup.js";

export async function putUser(user) {
  return await AppDataSource.createQueryBuilder().insert().into(User).values(user).execute();
}

export async function getUser(username) {
  return await AppDataSource.createQueryBuilder().select().from(User, "user").where("user.username = :username", { username }).getOne();
}