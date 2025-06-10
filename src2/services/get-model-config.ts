import { Book } from "../types/book.type";
import { env } from "./env";

export function getTextModelConfig(book: Book) {
    return {
        endpoint: env(`${book.model.text.toUpperCase()}_BASE_URL`),
        apiKey: env(`${book.model.text.toUpperCase()}_API_KEY`),
        modelName: env(`${book.model.text.toUpperCase()}_MODEL_NAME`),
        deployment: env(`${book.model.text.toUpperCase()}_DEPLOYMENT`),
    }
}
