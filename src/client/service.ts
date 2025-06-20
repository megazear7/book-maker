import {
  Book,
  BookId,
  Chapter,
  ChapterNumber,
  ChapterOutline,
  ChapterPart,
  ChapterPartNumber,
  ChapterParts,
} from "../types/book.type.js";
import { PostBookRequest } from "../types/requests.js";
import { toggleLoading } from "./loading.js";

export async function createBook(
  body: PostBookRequest,
): Promise<BookId> {
  toggleLoading();
  const res = await fetch(`/api/book`, {
    method: "POST",
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  toggleLoading();
  return BookId.parse(json);
}

export async function addChapter(
  book: BookId,
): Promise<Chapter> {
  toggleLoading();
  const res = await fetch(`/api/book/${book}/chapter/add`, {
    method: "POST",
  });
  const json = await res.json();
  toggleLoading();
  return Chapter.parse(json);
}

export async function createChapterOutline(
  book: BookId,
  chapter: ChapterNumber,
): Promise<ChapterOutline> {
  toggleLoading();
  const res = await fetch(`/api/book/${book}/chapter/${chapter}/outline`, {
    method: "POST",
  });
  const json = await res.json();
  toggleLoading();
  return ChapterOutline.parse(json);
}

export async function createChapter(
  book: BookId,
  chapter: ChapterNumber,
): Promise<ChapterParts> {
  toggleLoading();
  const res = await fetch(`/api/book/${book}/chapter/${chapter}`, {
    method: "POST",
  });
  const json = await res.json();
  toggleLoading();
  return ChapterParts.parse(json);
}

export async function createChapterPart(
  book: BookId,
  chapter: ChapterNumber,
  part: ChapterPartNumber,
): Promise<ChapterPart> {
  toggleLoading();
  const res = await fetch(`/api/book/${book}/chapter/${chapter}/part/${part}`, {
    method: "POST",
  });
  const json = await res.json();
  toggleLoading();
  return ChapterPart.parse(json);
}
