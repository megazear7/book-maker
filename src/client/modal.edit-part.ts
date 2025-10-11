import { createModal, ModalPart } from "./service.modal.js";
import { editChapterPart } from "./service.api.js";
import { Book, Chapter } from "../types/book.type.js";

export async function openEditPartModal(
  partNumber: number,
  book: Book,
  chapter: Chapter,
): Promise<void> {
  const fields: ModalPart[] = [
    {
      name: "addMoreDialog",
      label: "Add more dialog",
      type: "boolean",
      default: "false",
    },
    {
      name: "useLessDescriptiveLanguage",
      label: "Use less descriptive language",
      type: "boolean",
      default: "false",
    },
    {
      name: "replaceUndesirableWords",
      label: "Replace undesirable words",
      type: "boolean",
      default: "false",
    },
    {
      name: "splitIntoParagraphs",
      label: "Split into paragraphs",
      type: "boolean",
      default: "false",
    },
    {
      name: "removeOutOfPlaceReferences",
      label: "Remove out-of-place references",
      type: "boolean",
      default: "false",
    },
    {
      name: "additionalInstructions",
      label: "Additional Instructions",
      type: "textarea",
      value: "",
      placeholder: "Enter any additional editing instructions...",
    },
  ];

  createModal("Edit Chapter Part", "Edit", fields, async (result) => {
    // Prepare the edit options
    const options = {
      addMoreDialog:
        result.find((r) => r.name === "addMoreDialog")?.value === true,
      useLessDescriptiveLanguage:
        result.find((r) => r.name === "useLessDescriptiveLanguage")?.value ===
        true,
      replaceUndesirableWords:
        result.find((r) => r.name === "replaceUndesirableWords")?.value ===
        true,
      splitIntoParagraphs:
        result.find((r) => r.name === "splitIntoParagraphs")?.value === true,
      removeOutOfPlaceReferences:
        result.find((r) => r.name === "removeOutOfPlaceReferences")?.value ===
        true,
      additionalInstructions:
        (result.find((r) => r.name === "additionalInstructions")
          ?.value as string) || "",
    };

    try {
      // Use the API service function
      await editChapterPart(book, chapter, partNumber, options);
      // Reload the page to show the edited content
      window.location.reload();
    } catch (error) {
      console.error("Failed to edit chapter part:", error);
      alert("Failed to edit chapter part. Please try again.");
    }
  });
}
