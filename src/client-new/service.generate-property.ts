import { Book } from "../types/book.type.js";
import { createLitModal, ModalForm, ModalPartInput } from "./service.modal.js";
import { generatePropertyApi } from "./service.api.js";
import { getProperty } from "../shared/util.js";

export function generateProperty(book: Book, property: string): void {
  const value = getProperty(book, property.split("book.")[1]);
  const length = value.split(" ").length;

  const inputs: ModalPartInput[] = [
    {
      name: "instructions",
      label: "Instructions",
      type: "textarea",
      placeholder: "Expand to include more details...",
    },
    {
      name: "wordCount",
      label: "Word Count",
      type: "number",
      value: length.toString() || "100",
    },
  ];

  const form = document.createElement('modal-form') as ModalForm;
  form.inputs = inputs;
  form.onSubmit = async (data: any) => {
    const instructions = data.instructions;
    const wordCount = parseInt(data.wordCount);
    await generatePropertyApi(book.id, property, instructions, wordCount);
    // Reload the page to reflect changes
    window.location.reload();
  };

  const modal = createLitModal(`Generate ${property}`, form);
  document.body.appendChild(modal);
  modal.open = true;
}
