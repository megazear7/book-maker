import {
  BookId,
  ChapterNumber,
  ChapterOutline,
  ChapterParts,
} from "../types/book.type.js";
import { toggleLoading } from "./loading.js";

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
