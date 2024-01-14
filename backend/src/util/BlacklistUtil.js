import { BlacklistedPU } from "../database/entity/BlacklistedPU.js";
import { AppDataSource } from "../database/newDbSetup.js";

export async function addMissingBlacklistedPUs(blacklistedPUs) {
  await Promise.all(
    await blacklistedPUs.map(async (PU) => {
      try {
        const blacklistedPU = await AppDataSource.getRepository(
          BlacklistedPU
        ).findOneBy({ puNickname: PU.nickname });
        //TO-DO verify admin certificate for blacklisting
        if (!blacklistedPU) {
          await AppDataSource.manager.save(BlacklistedPU, {
            puNickname: PU.nickname,
            cert: PU.cert,
          });
        }
      } catch (error) {
        console.log("Error while saving blacklisted PU.");
        throw error;
      }
    })
  );
}
