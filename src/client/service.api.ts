import { ZodSchema } from "zod";
import {
  Book,
  BookId,
  Chapter,
  ChapterOutline,
  ChapterPart,
  ChapterPartNumber,
  ChapterParts,
  LoadingMessageContent,
} from "../types/book.type.js";
import {
  CreateEmptyBookRequest,
  PostBookRequest,
  RequestMethod,
  RequestPath,
} from "../types/requests.js";
import { toggleLoading } from "./service.loading.js";

async function request<A, B>({
  path,
  method,
  body,
  loading,
  responseType,
}: {
  path: RequestPath;
  method: RequestMethod;
  responseType: ZodSchema<B>;
  loading: LoadingMessageContent;
  body?: A;
}): Promise<B> {
  const cleanup = await toggleLoading(loading);
  try {
    const config: RequestInit = {
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
    };
    if (body) config.body = JSON.stringify(body);
    const res = await fetch(path, config);
    const json = await res.json();
    cleanup();
    return responseType.parse(json);
  } catch {
    cleanup();
    throw new Error("API failed");
  }
}

async function post<A, B>({
  path,
  responseType,
  loading,
  body,
}: {
  path: RequestPath;
  responseType: ZodSchema<B>;
  loading: LoadingMessageContent;
  body?: A;
}): Promise<B> {
  return request({
    path: path,
    method: RequestMethod.enum.POST,
    responseType,
    loading,
    body,
  });
}

export async function createBook(body: PostBookRequest): Promise<BookId> {
  return post({
    path: `/api/book`,
    responseType: BookId,
    loading: body.description,
    body,
  });
}

export async function addEmptyBook(
  body: CreateEmptyBookRequest,
): Promise<Book> {
  return post({
    path: `/api/book/empty`,
    responseType: Book,
    loading: body.title,
    body,
  });
}

export async function addChapter(book: Book): Promise<Chapter> {
  return post({
    path: `/api/book/${book.id}/chapter/add`,
    responseType: Chapter,
    loading: book.overview,
  });
}

export async function createChapterOutline(
  book: Book,
  chapter: Chapter,
): Promise<ChapterOutline> {
  return post({
    path: `/api/book/${book.id}/chapter/${chapter.number}/outline`,
    responseType: ChapterOutline,
    loading: chapter.what + "\n" + chapter.who,
  });
}

export async function createChapter(
  book: Book,
  chapter: Chapter,
): Promise<ChapterParts> {
  return post({
    path: `/api/book/${book.id}/chapter/${chapter.number}`,
    responseType: ChapterParts,
    loading: chapter.outline.join("\n"),
  });
}

export async function createChapterAudio(
  book: Book,
  chapter: Chapter,
): Promise<ChapterParts> {
  return post({
    path: `/api/book/${book.id}/chapter/${chapter.number}/audio`,
    responseType: ChapterParts,
    loading: chapter.outline.join("\n"),
  });
}

export async function createChapterPart(
  book: Book,
  chapter: Chapter,
  part: ChapterPartNumber,
): Promise<ChapterPart> {
  return post({
    path: `/api/book/${book.id}/chapter/${chapter.number}/part/${part}`,
    responseType: ChapterPart,
    loading: chapter.outline[part - 1],
  });
}

export async function createChapterPartAudio(
  book: Book,
  chapter: Chapter,
  part: ChapterPartNumber,
): Promise<ChapterPart> {
  return post({
    path: `/api/book/${book.id}/chapter/${chapter.number}/part/${part}/audio`,
    responseType: ChapterPart,
    loading: chapter.outline[part - 1],
  });
}

export async function downloadFullAudio(book: Book): Promise<void> {
  const cleanup = await toggleLoading(
    "Messages about creating audio book mp3 file",
  );
  try {
    const response = await fetch(`/api/book/${book.id}/audio.mp3`);
    if (!response.ok) {
      throw new Error("Failed to download audio");
    }
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${book.id}.mp3`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }, 100);
    cleanup();
  } catch {
    cleanup();
    throw new Error("API failed");
  }
}

export async function saveBook(book: Book): Promise<Book> {
  return post({
    path: `/api/book/${book.id}/save`,
    responseType: Book,
    loading: "Saving book...",
    body: book,
  });
}

export async function generatePropertyApi(
  bookId: string,
  property: string,
  instructions: string,
  wordCount: number,
): Promise<Book> {
  return post({
    path: `/api/book/${bookId}/property/${property}`,
    responseType: Book,
    loading: `Generating ${property}...`,
    body: { instructions, wordCount },
  });
}

export async function generateEverythingApi(
  bookId: string,
  maxSpend: number,
): Promise<Book> {
  return post({
    path: `/api/book/${bookId}/generate-everything`,
    responseType: Book,
    loading: `Generating everything for book...`,
    body: { maxSpend },
  });
}
