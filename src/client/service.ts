import {
  Book,
  BookId,
  Chapter,
  ChapterNumber,
  ChapterOutline,
  ChapterPart,
  ChapterPartNumber,
  ChapterParts,
  LoadingMessageContent,
  LoadingMessages,
} from "../types/book.type.js";
import { CreateEmptyBookRequest, PostBookRequest } from "../types/requests.js";
import { toggleLoading } from "./loading.js";

export async function createBook(
  body: PostBookRequest,
): Promise<BookId> {
  const cleanup = await toggleLoading(body.description);
  try {
    const res = await fetch(`/api/book`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    const json = await res.json();
    cleanup();
    return BookId.parse(json);
  } catch {
    cleanup();
    throw new Error("API failed");
  }
}

export async function addEmptyBook(
  body: CreateEmptyBookRequest,
): Promise<Book> {
  const cleanup = await toggleLoading(body.title);
  const res = await fetch(`/api/book/empty`, {
    method: "POST",
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  cleanup();
  return Book.parse(json);
}

export async function addChapter(
  book: Book,
): Promise<Chapter> {
  const cleanup = await toggleLoading(book.overview);
  const res = await fetch(`/api/book/${book.id}/chapter/add`, {
    method: "POST",
  });
  const json = await res.json();
  cleanup();
  return Chapter.parse(json);
}

export async function createChapterOutline(
  book: Book,
  chapter: Chapter,
): Promise<ChapterOutline> {
  const cleanup = await toggleLoading(chapter.what + '\n' + chapter.who);
  const res = await fetch(`/api/book/${book.id}/chapter/${chapter.number}/outline`, {
    method: "POST",
  });
  const json = await res.json();
  cleanup();
  return ChapterOutline.parse(json);
}

export async function createChapter(
  book: Book,
  chapter: Chapter,
): Promise<ChapterParts> {
  const cleanup = await toggleLoading(chapter.outline.join('\n'));
  const res = await fetch(`/api/book/${book.id}/chapter/${chapter.number}`, {
    method: "POST",
  });
  const json = await res.json();
  cleanup();
  return ChapterParts.parse(json);
}

export async function createChapterPart(
  book: Book,
  chapter: Chapter,
  part: ChapterPartNumber,
): Promise<ChapterPart> {
  const cleanup = await toggleLoading(chapter.outline[part-1]);
  const res = await fetch(`/api/book/${book.id}/chapter/${chapter.number}/part/${part}`, {
    method: "POST",
  });
  const json = await res.json();
  cleanup();
  return ChapterPart.parse(json);
}
