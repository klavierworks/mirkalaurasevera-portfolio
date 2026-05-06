import dotenv from "dotenv";

import { updateVideoRecord } from "./update";

dotenv.config();

type RevertEntry = {
  recordId: string;
  originalVideoUrl: string;
};

const REVERTS: RevertEntry[] = [
  {
    recordId: "6t7Nxegi8UZAJiEhy4QiEd",
    originalVideoUrl: "https://vimeo.com/1169499793?fl=tl&fe=ec",
  },
  {
    recordId: "5KrucTd1uUZ9sMiNIOJqH1",
    originalVideoUrl: "https://vimeo.com/1169499793?fl=pl&fe=sh",
  },
  {
    recordId: "3MP98lipXaFaBGeFki5BU5",
    originalVideoUrl: "https://vimeo.com/1169499793?fl=pl&fe=sh",
  },
  {
    recordId: "7l7Xgy3yqMmDhdrDSG1vBZ",
    originalVideoUrl: "https://vimeo.com/1126129241",
  },
  {
    recordId: "01JETf8jhfsJRPOQ3Y1ONV",
    originalVideoUrl: "https://vimeo.com/1125816191",
  },
];

const requireEnv = (name: string) => {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }

  return value;
};

const revert = async () => {
  const contentfulSpaceId = requireEnv("CONTENTFUL_SPACE_ID");
  const contentfulManagementApiKey = requireEnv("CONTENTFUL_MANAGEMENT_API_KEY");

  let revertedCount = 0;
  let failedCount = 0;

  for (const { recordId, originalVideoUrl } of REVERTS) {
    try {
      console.log(`Reverting ${recordId} -> ${originalVideoUrl}`);

      await updateVideoRecord({
        spaceId: contentfulSpaceId,
        accessToken: contentfulManagementApiKey,
        entryId: recordId,
        updatedVideo: {
          video: originalVideoUrl,
        },
      });

      console.log(`Reverted ${recordId}`);
      revertedCount = revertedCount + 1;
    } catch (error) {
      console.error(`Failed to revert ${recordId}:`, error);
      failedCount = failedCount + 1;
    }
  }

  console.log(
    `Done. Reverted: ${revertedCount}, failed: ${failedCount}.`,
  );
};

revert();
