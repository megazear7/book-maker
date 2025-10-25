import { ZodSchema } from "zod";
import {
  Book,
  BookId,
  Chapter,
  ChapterOutline,
  ChapterPart,
  ChapterPartNumber,
  ChapterParts,
} from "../types/book.type.js";
import {
  CreateEmptyBookRequest,
  PostBookRequest,
  RequestMethod,
  RequestPath,
} from "../types/requests.js";

// Simplified for LitElement - loading handled in components
async function request<A, B>({
  path,
  method,
  body,
  responseType,
}: {
  path: RequestPath;
  method: RequestMethod;
  responseType: ZodSchema<B>;
  body?: A;
}): Promise<B> {
  try {
    const config: RequestInit = {
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
    };
    if (body) config.body = JSON.stringify(body);
    const res = await fetch(path, config);
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    const json = await res.json();
    return responseType.parse(json);
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

async function post<A, B>({
  path,
  responseType,
  body,
}: {
  path: RequestPath;
  responseType: ZodSchema<B>;
  body?: A;
}): Promise<B> {
  return request({
    path: path,
    method: RequestMethod.enum.POST,
    responseType,
    body,
  });
}

export async function createBook(body: PostBookRequest): Promise<BookId> {
  return post({
    path: `/api/book`,
    responseType: BookId,
    body,
  });
}

export async function addEmptyBook(
  body: CreateEmptyBookRequest,
): Promise<Book> {
  return post({
    path: `/api/book/empty`,
    responseType: Book,
    body,
  });
}

export async function addChapter(book: Book): Promise<Chapter> {
  return post({
    path: `/api/book/${book.id}/chapter/add`,
    responseType: Chapter,
  });
}

export async function createChapterOutline(
  book: Book,
  chapter: Chapter,
): Promise<ChapterOutline> {
  return post({
    path: `/api/book/${book.id}/chapter/${chapter.number}/outline`,
    responseType: ChapterOutline,
  });
}

export async function createChapter(
  book: Book,
  chapter: Chapter,
): Promise<ChapterParts> {
  return post({
    path: `/api/book/${book.id}/chapter/${chapter.number}`,
    responseType: ChapterParts,
  });
}

export async function createChapterAudio(
  book: Book,
  chapter: Chapter,
): Promise<ChapterParts> {
  return post({
    path: `/api/book/${book.id}/chapter/${chapter.number}/audio`,
    responseType: ChapterParts,
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
  });
}

export async function editChapterPart(
  book: Book,
  chapter: Chapter,
  part: ChapterPartNumber,
  options: {
    addMoreDialog?: boolean;
    useLessDescriptiveLanguage?: boolean;
    replaceUndesirableWords?: boolean;
    splitIntoParagraphs?: boolean;
    removeOutOfPlaceReferences?: boolean;
    additionalInstructions?: string;
  },
): Promise<ChapterPart> {
  return post({
    path: `/api/book/${book.id}/chapter/${chapter.number}/part/${part}/edit`,
    responseType: ChapterPart,
    body: options,
  });
}

export async function downloadFullAudio(book: Book): Promise<void> {
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
}

export async function saveBook(book: Book): Promise<Book> {
  return post({
    path: `/api/book/${book.id}/save`,
    responseType: Book,
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
    body: { maxSpend },
  });
}
