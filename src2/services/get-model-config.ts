import { Book } from "../types/book.type";
import { env } from "./env";

export function getTextModelConfig(book: Book) {
    return {
        endpoint: env(`${book.model.text.name.toUpperCase()}_BASE_URL`),
        apiKey: env(`${book.model.text.name.toUpperCase()}_API_KEY`),
        modelName: env(`${book.model.text.name.toUpperCase()}_MODEL_NAME`),
        deployment: env(`${book.model.text.name.toUpperCase()}_DEPLOYMENT`),
    }
}
