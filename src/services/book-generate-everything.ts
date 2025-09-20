import { getBook } from "./get-book.js";
import { createChapterOutline } from "./create-chapter-outline.js";
import { createChapter } from "./create-chapter.js";
import { createChapterAudio } from "./create-chapter-audio.js";
import { Book } from "../types/book.type.js";

export async function generateEverything(
    bookName: string,
    maxSpend: number,
): Promise<Book> {
    console.log(
        `Starting generate everything for book: ${bookName} with max spend: $${maxSpend}`,
    );

    let book = await getBook(bookName);
    const million = 1000000;

    const calculateCost = (book: Book): number => {
        return (
            book.model.text.usage.completion_tokens *
            (book.model.text.cost.outputTokenCost / million) +
            book.model.text.usage.prompt_tokens *
            (book.model.text.cost.inputTokenCost / million)
        );
    };

    const initialCost = calculateCost(book);
    console.log(`Initial cost: $${initialCost.toFixed(4)}`);

    //for (const chapter of book.chapters) {
    for (let i = 0; i < book.chapters.length; i++) {
        let chapter = book.chapters[i];
        const currentCost = calculateCost(await getBook(bookName)) - initialCost;
        console.log(
            `Chapter ${chapter.number}: Current accumulated cost: $${currentCost.toFixed(4)}`,
        );

        if (currentCost >= maxSpend) {
            console.log(`Max spend limit reached. Stopping generation.`);
            break;
        }

        // Generate outline if missing
        if (chapter.outline.length === 0) {
            console.log(`Chapter ${chapter.number}: Generating outline...`);
            await createChapterOutline(bookName, chapter.number);
            book = await getBook(bookName);
            chapter = book.chapters[i];
            const newCost = calculateCost(book) - initialCost;
            console.log(
                `Chapter ${chapter.number}: Outline generated. New cost: $${newCost.toFixed(4)}`,
            );
            if (newCost >= maxSpend) {
                console.log(
                    `Max spend limit reached after outline generation. Stopping.`,
                );
                break;
            }
        } else {
            console.log(
                `Chapter ${chapter.number}: Outline already exists, skipping.`,
            );
        }

        // Generate parts if missing
        if (chapter.parts.length === 0) {
            console.log(`Chapter ${chapter.number}: Generating parts...`);
            await createChapter(bookName, chapter.number);
            book = await getBook(bookName);
            chapter = book.chapters[i];
            const newCost = calculateCost(book) - initialCost;
            console.log(
                `Chapter ${chapter.number}: Parts generated. New cost: $${newCost.toFixed(4)}`,
            );
            if (newCost >= maxSpend) {
                console.log(
                    `Max spend limit reached after parts generation. Stopping.`,
                );
                break;
            }
        } else {
            console.log(`Chapter ${chapter.number}: Parts already exist, skipping.`);
        }

        // Generate audio if missing
        if (chapter.parts.length > 0 && !chapter.parts[0].audio) {
            console.log(`Chapter ${chapter.number}: Generating audio...`);
            await createChapterAudio(bookName, chapter.number);
            book = await getBook(bookName);
            chapter = book.chapters[i];
            const newCost = calculateCost(book) - initialCost;
            console.log(
                `Chapter ${chapter.number}: Audio generated. New cost: $${newCost.toFixed(4)}`,
            );
            if (newCost >= maxSpend) {
                console.log(
                    `Max spend limit reached after audio generation. Stopping.`,
                );
                break;
            }
        } else if (chapter.parts.length > 0 && chapter.parts[0].audio) {
            console.log(`Chapter ${chapter.number}: Audio already exists, skipping.`);
        } else {
            console.log(
                `Chapter ${chapter.number}: No parts to generate audio for, skipping.`,
            );
        }
    }

    const finalBook = await getBook(bookName);
    const finalCost = calculateCost(finalBook) - initialCost;
    console.log(`Generation complete. Total cost: $${finalCost.toFixed(4)}`);

    return finalBook;
}
