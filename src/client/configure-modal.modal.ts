import { Book, KnownModelTypeName } from "../types/book.type.js";
import { createModal, ModalPartInput } from "./modal.js";

export function openConfigurationModal(book: Book) {
    // Only allow editing model names (string type)
    // Get known model names from statically imported KnownModelTypeName enum
    const knownModelNames = KnownModelTypeName.options;
    const fields: ModalPartInput[] = [
        {
            name: "textModelName",
            label: "Text Model Name",
            type: "dropdown",
            options: knownModelNames.map(n => ({ label: n, value: n })),
            default: typeof book.model.text.name === "string" ? book.model.text.name : ""
        },
        {
            name: "audioModelName",
            label: "Audio Model Name",
            type: "dropdown",
            options: knownModelNames.map(n => ({ label: n, value: n })),
            default: typeof book.model.audio.name === "string" ? book.model.audio.name : ""
        },
        // Text model cost fields
        {
            name: "textInputTokenCost",
            label: "Text Input Token Cost",
            type: "plaintext",
            default: String(book.model.text.cost.inputTokenCost ?? "")
        },
        {
            name: "textInputTokenCount",
            label: "Text Input Token Count",
            type: "plaintext",
            default: String(book.model.text.cost.inputTokenCount ?? "")
        },
        {
            name: "textOutputTokenCost",
            label: "Text Output Token Cost",
            type: "plaintext",
            default: String(book.model.text.cost.outputTokenCost ?? "")
        },
        {
            name: "textOutputTokenCount",
            label: "Text Output Token Count",
            type: "plaintext",
            default: String(book.model.text.cost.outputTokenCount ?? "")
        },
        // Audio model cost fields
        {
            name: "audioInputTokenCost",
            label: "Audio Input Token Cost",
            type: "plaintext",
            default: String(book.model.audio.cost.inputTokenCost ?? "")
        },
        {
            name: "audioInputTokenCount",
            label: "Audio Input Token Count",
            type: "plaintext",
            default: String(book.model.audio.cost.inputTokenCount ?? "")
        },
        {
            name: "audioOutputTokenCost",
            label: "Audio Output Token Cost",
            type: "plaintext",
            default: String(book.model.audio.cost.outputTokenCost ?? "")
        },
        {
            name: "audioOutputTokenCount",
            label: "Audio Output Token Count",
            type: "plaintext",
            default: String(book.model.audio.cost.outputTokenCount ?? "")
        }
    ];
    createModal(
        "Configure Model",
        "Save",
        fields,
        async (result) => {
            // Update book.model with new values
            const textModelName = String(result.find(r => r.name === "textModelName")?.value ?? "");
            const audioModelName = String(result.find(r => r.name === "audioModelName")?.value ?? "");
            book.model.text.name = textModelName;
            book.model.audio.name = audioModelName;
            // Save changes
            await fetch(`/api/book/${book.id}/save`, {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(book)
            });
            window.location.reload();
        }
    );
}
