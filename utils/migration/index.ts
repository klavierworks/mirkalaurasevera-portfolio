import { unlink } from "node:fs/promises";

import dotenv from "dotenv";

import { getAllVideoRecords } from "./get";
import { updateVideoRecord } from "./update";
import { getLargestDirectVideoFileUrl } from "./vimeo";
import { downloadVimeoVideo } from "./videos";
import { isBunnyVideoUrl, uploadVideoToBunnyCdn } from "./bunny";

dotenv.config();

// First-run safety: counts attempted (success or fail) records, ignoring skips.
// Set to undefined for full migration after verifying one record end-to-end.
const MIGRATE_LIMIT: number | undefined = undefined;

const requireEnv = (name: string) => {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }

  return value;
};

const migrate = async () => {
  const contentfulSpaceId = requireEnv("CONTENTFUL_SPACE_ID");
  const contentfulDeliveryApiKey = requireEnv("CONTENTFUL_API_KEY");
  const contentfulManagementApiKey = requireEnv("CONTENTFUL_MANAGEMENT_API_KEY");
  const vimeoClientToken = requireEnv("VIMEO_CLIENT_TOKEN");
  const bunnyStreamApiKey = requireEnv("BUNNY_STREAM_API_KEY");
  const bunnyStreamLibraryId = Number(requireEnv("BUNNY_STREAM_LIBRARY_ID"));

  if (!Number.isFinite(bunnyStreamLibraryId)) {
    throw new Error("BUNNY_STREAM_LIBRARY_ID must be a number.");
  }

  const videoRecords = await getAllVideoRecords({
    spaceId: contentfulSpaceId,
    accessToken: contentfulDeliveryApiKey,
    pageSize: 1000,
  });

  let migratedCount = 0;
  let skippedCount = 0;
  let failedCount = 0;

  for (const videoRecord of videoRecords) {
    if (
      MIGRATE_LIMIT !== undefined &&
      migratedCount + failedCount >= MIGRATE_LIMIT
    ) {
      console.log(`Hit MIGRATE_LIMIT=${MIGRATE_LIMIT}, stopping.`);
      break;
    }

    const recordId = videoRecord.sys.id;
    const videoField = videoRecord.fields.video as string | undefined;

    if (!videoField || !videoField.includes("vimeo.com")) {
      console.log(`Skipping ${recordId}: not a Vimeo URL.`);
      skippedCount = skippedCount + 1;
      continue;
    }

    if (isBunnyVideoUrl({ url: videoField })) {
      console.log(`Skipping ${recordId}: already migrated to Bunny.`);
      skippedCount = skippedCount + 1;
      continue;
    }

    let downloadedFilePath: string | undefined;

    try {
      console.log(`Migrating ${recordId} (${videoField})`);

      const directFileUrl = await getLargestDirectVideoFileUrl({
        vimeoUrl: videoField,
        accessToken: vimeoClientToken,
      });

      const { filePath } = await downloadVimeoVideo({
        videoUrl: directFileUrl,
        fileName: `${recordId}.mp4`,
      });
      downloadedFilePath = filePath;

      const { playbackUrl } = await uploadVideoToBunnyCdn({
        filePath,
        libraryId: bunnyStreamLibraryId,
        accessKey: bunnyStreamApiKey,
        title: recordId,
      });

      await updateVideoRecord({
        spaceId: contentfulSpaceId,
        accessToken: contentfulManagementApiKey,
        entryId: recordId,
        updatedVideo: {
          video: playbackUrl,
        },
      });

      console.log(`Migrated ${recordId} -> ${playbackUrl}`);
      migratedCount = migratedCount + 1;

      await unlink(downloadedFilePath).catch((error) => {
        console.warn(`Could not remove ${downloadedFilePath}:`, error);
      });
    } catch (error) {
      console.error(`Failed ${recordId}:`, error);
      if (downloadedFilePath) {
        console.error(`  Kept downloaded file for inspection: ${downloadedFilePath}`);
      }
      failedCount = failedCount + 1;
    }
  }

  console.log(
    `Done. Migrated: ${migratedCount}, skipped: ${skippedCount}, failed: ${failedCount}.`,
  );
};

migrate();
