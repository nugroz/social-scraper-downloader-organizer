/* eslint-disable no-param-reassign */
import { resolve } from "path";
import { URL } from "url";
import delay from "delay";
import fs from "fs-extra";
import { ListrTask } from "listr2";
import { Context } from "@/utils/tiktok/interfaces";
import { getPathFolderProfile } from "@/utils/tiktok/paths";
import downloadImage from "@/utils/tiktok/profile/downloadImage";
import scrapingVideoByType from "@/utils/tiktok/profile/scrapingVideoByType";
import { scrapeProfile } from "@/utils/tiktok/scraper";

const scrapingProfile = (profile: string): ListrTask<Context> => ({
  title: `Scraping ${profile}`,
  task: async (ctx, task) => {
    task.output = "Scraping image of profile";

    await delay(60 * 1000);

    const profileTiktok = await scrapeProfile(profile, ctx.session);

    if (profileTiktok === null) {
      // TODO: Get id of the profile from folder already downloaded, scrape profile by id, rename the folder profile, scrape posts and image.
    } else {
      const PATH_ID = resolve(getPathFolderProfile(profile), "ID");

      if (!fs.existsSync(PATH_ID)) {
        fs.writeFileSync(PATH_ID, profileTiktok.user.id);
      }

      if (profileTiktok.user.avatarLarger !== "") {
        await downloadImage(
          profileTiktok.user.avatarLarger,
          profile,
          new URL(profileTiktok.user.avatarLarger).pathname
            .split("/")
            .pop() as string
        );
      }

      await scrapingVideoByType(task, "advance", profile, ctx.session);
    }
  },
});

export default scrapingProfile;
