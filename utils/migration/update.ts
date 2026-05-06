// contentful/updateVideoRecord.ts
import { createClient } from "contentful-management";

type ProjectMediaFields = {
  image?: {
    sys: {
      type: "Link";
      linkType: "Asset";
      id: string;
    };
  };
  video?: string;
  hasAudio?: boolean;
};

type UpdateVideoRecordParams = {
  spaceId: string;
  accessToken: string;
  entryId: string;
  updatedVideo: ProjectMediaFields;
  locale?: string;
};

const ENVIRONMENT_ID = "master";

const createContentfulManagementClient = ({
  accessToken,
}: {
  accessToken: string;
}) => {
  return createClient({
    accessToken,
  });
};

const mergeLocalizedField = ({
  existing,
  locale,
  value,
}: {
  existing: unknown;
  locale: string;
  value: unknown;
}) => {
  const base =
    existing && typeof existing === "object"
      ? (existing as Record<string, unknown>)
      : {};

  return {
    ...base,
    [locale]: value,
  };
};

const applyUpdatedFields = ({
  fields,
  updatedVideo,
  locale,
}: {
  fields: Record<string, unknown>;
  updatedVideo: ProjectMediaFields;
  locale: string;
}) => {
  const next: Record<string, unknown> = { ...fields };

  if (updatedVideo.image !== undefined) {
    next.image = mergeLocalizedField({
      existing: fields.image,
      locale,
      value: updatedVideo.image,
    });
  }

  if (updatedVideo.video !== undefined) {
    next.video = mergeLocalizedField({
      existing: fields.video,
      locale,
      value: updatedVideo.video,
    });
  }

  if (updatedVideo.hasAudio !== undefined) {
    next.hasAudio = mergeLocalizedField({
      existing: fields.hasAudio,
      locale,
      value: updatedVideo.hasAudio,
    });
  }

  return next;
};

export const updateVideoRecord = async ({
  spaceId,
  accessToken,
  entryId,
  updatedVideo,
  locale = "en-US",
}: UpdateVideoRecordParams) => {
  const client = createContentfulManagementClient({
    accessToken,
  });

  const entryParams = {
    spaceId,
    environmentId: ENVIRONMENT_ID,
    entryId,
  };

  const entry = await client.entry.get(entryParams);

  entry.fields = applyUpdatedFields({
    fields: entry.fields,
    updatedVideo,
    locale,
  });

  const updatedEntry = await client.entry.update(entryParams, entry);
  const publishedEntry = await client.entry.publish(entryParams, updatedEntry);

  return publishedEntry;
};
