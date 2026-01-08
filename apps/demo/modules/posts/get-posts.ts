import { MOCK_POSTS } from "@ratio/mock-data";

import type {
  PostsSearchParams,
  Filters,
  Sort,
  FilterValue,
} from "@/lib/search-params/posts-search-params";

import type { Post, GetPostsResult } from "./types";

const postsCache = new Map<string, GetPostsResult>();

function createCacheKey(params: PostsSearchParams): string {
  return JSON.stringify(params);
}

export async function getPosts(
  params: PostsSearchParams
): Promise<GetPostsResult> {
  const cacheKey = createCacheKey(params);
  const cachedResult = postsCache.get(cacheKey);

  if (cachedResult) {
    return cachedResult;
  }

  await new Promise((resolve) => setTimeout(resolve, 1000));

  let posts: Post[] = [...(MOCK_POSTS as Post[])];

  posts = applyFilters(posts, params.filter);
  posts = applySorting(posts, params.sort);

  const total = Math.ceil(posts.length / params.perPage);
  const start = (params.page - 1) * params.perPage;
  const end = start + params.perPage;

  posts = posts.slice(start, end);

  const result: GetPostsResult = { posts, total };

  postsCache.set(cacheKey, result);

  return result;
}

function applyFilters(posts: Post[], filters: Filters): Post[] {
  return posts.filter((post) => {
    for (const [columnId, filterValue] of Object.entries(filters)) {
      if (!filterValue) continue;

      if (!matchesFilter(post, columnId, filterValue)) {
        return false;
      }
    }
    return true;
  });
}

function matchesFilter(
  post: Post,
  columnId: string,
  filterValue: FilterValue
): boolean {
  if ("text" in filterValue && filterValue.text) {
    const searchText = filterValue.text.toLowerCase();
    const fieldValue = getFieldValue(post, columnId);
    if (
      typeof fieldValue === "string" &&
      !fieldValue.toLowerCase().includes(searchText)
    ) {
      return false;
    }
  }

  if ("dateRange" in filterValue && filterValue.dateRange) {
    const [from, to] = filterValue.dateRange;
    const fieldValue = getFieldValue(post, columnId);
    if (typeof fieldValue === "string") {
      const dateValue = new Date(fieldValue).getTime();
      if (from && dateValue < from) return false;
      if (to && dateValue > to) return false;
    }
  }

  if ("multiSelect" in filterValue && filterValue.multiSelect.length > 0) {
    const fieldValue = getFieldValue(post, columnId);
    if (!filterValue.multiSelect.includes(String(fieldValue))) {
      return false;
    }
  }

  if ("user" in filterValue && filterValue.user) {
    const searchUser = filterValue.user.toLowerCase();
    const author = post.author;
    if (author) {
      const matchesName = author.name.toLowerCase().includes(searchUser);
      const matchesUsername = author.username
        .toLowerCase()
        .includes(searchUser);
      if (!matchesName && !matchesUsername) return false;
    } else {
      return false;
    }
  }

  return true;
}

function getFieldValue(post: Post, columnId: string): unknown {
  if (columnId === "author") {
    return post.author?.name;
  }
  return post[columnId as keyof Post];
}

function applySorting(posts: Post[], sort: Sort): Post[] {
  const sortEntries = Object.entries(sort);
  if (sortEntries.length === 0) return posts;

  return [...posts].sort((a, b) => {
    for (const [columnId, direction] of sortEntries) {
      const aValue = getFieldValue(a, columnId);
      const bValue = getFieldValue(b, columnId);

      let comparison = 0;

      if (columnId === "createdAt" || columnId === "updatedAt") {
        comparison =
          new Date(aValue as string).getTime() -
          new Date(bValue as string).getTime();
      } else if (typeof aValue === "string" && typeof bValue === "string") {
        comparison = aValue.localeCompare(bValue);
      } else {
        comparison = String(aValue).localeCompare(String(bValue));
      }

      if (comparison !== 0) {
        return direction === "desc" ? -comparison : comparison;
      }
    }
    return 0;
  });
}
