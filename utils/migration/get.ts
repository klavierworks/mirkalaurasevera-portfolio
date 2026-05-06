// contentful/getAllVideoRecords.ts
import {
  createClient,
  type Asset,
  type Entry,
  type EntryCollection,
  type EntrySkeletonType,
} from "contentful";

type ProjectMediaFields = {
  image?: Asset;
  video?: string;
  hasAudio?: boolean;
};

type ProjectMediaSkeleton = EntrySkeletonType<ProjectMediaFields, "projectMedia">;

type GetAllVideoRecordsParams = {
  spaceId: string;
  accessToken: string;
  pageSize?: number;
};

const createContentfulClient = ({
  spaceId,
  accessToken,
}: GetAllVideoRecordsParams) => {
  return createClient({
    space: spaceId,
    accessToken,
    environment: "master",
  });
};

const normalizePageSize = ({ pageSize = 1000 }: { pageSize?: number }) => {
  const maximumPageSize = 1000;

  if (pageSize < 1) {
    return 1;
  }

  if (pageSize > maximumPageSize) {
    return maximumPageSize;
  }

  return pageSize;
};

const fetchProjectMediaPage = async ({
  client,
  skip,
  limit,
}: {
  client: ReturnType<typeof createContentfulClient>;
  skip: number;
  limit: number;
}): Promise<EntryCollection<ProjectMediaSkeleton, undefined, string>> => {
  return client.getEntries<ProjectMediaSkeleton>({
    content_type: "projectMedia",
    skip,
    limit,
  });
};

const shouldFetchAnotherPage = ({
  collectedCount,
  totalCount,
}: {
  collectedCount: number;
  totalCount: number;
}) => {
  return collectedCount < totalCount;
};

const appendItems = <T>({
  currentItems,
  nextItems,
}: {
  currentItems: T[];
  nextItems: T[];
}) => {
  return [...currentItems, ...nextItems];
};

export const getAllVideoRecords = async ({
  spaceId,
  accessToken,
  pageSize,
}: GetAllVideoRecordsParams): Promise<Entry<ProjectMediaSkeleton, undefined, string>[]> => {
  const client = createContentfulClient({
    spaceId,
    accessToken,
  });

  const limit = normalizePageSize({ pageSize });

  let skip = 0;
  let total = 0;
  let allVideoRecords: Entry<ProjectMediaSkeleton, undefined, string>[] = [];

  do {
    const { items, total: responseTotal } = await fetchProjectMediaPage({
      client,
      skip,
      limit,
    });

    total = responseTotal;
    allVideoRecords = appendItems({
      currentItems: allVideoRecords,
      nextItems: items,
    });

    skip = skip + items.length;
  } while (
    shouldFetchAnotherPage({
      collectedCount: allVideoRecords.length,
      totalCount: total,
    })
  );

  return allVideoRecords;
};