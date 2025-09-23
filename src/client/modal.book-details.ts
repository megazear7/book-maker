import { Book } from "../types/book.type.js";
import { createModal, ModalPart } from "./service.modal.js";

export async function openBookDetailsModal(book: Book): Promise<void> {
  const fields: ModalPart[] = [
    {
      name: "authorName",
      label: "Author Name",
      type: "plaintext",
      default: book.details?.authorName ?? "",
    },
    {
      name: "isbn",
      label: "ISBN",
      type: "plaintext",
      default: book.details?.isbn ?? "",
    },
    {
      name: "dedication",
      label: "Dedication",
      type: "textarea",
      value: book.details?.dedication ?? "",
    },
    {
      name: "acknowledgements",
      label: "Acknowledgements",
      type: "textarea",
      value: book.details?.acknowledgements ?? "",
    },
    {
      name: "aboutTheAuthor",
      label: "About the Author",
      type: "textarea",
      value: book.details?.aboutTheAuthor ?? "",
    },
  ];

  createModal("Book Details", "Save", fields, async (result) => {
    // Update book details
    if (!book.details) {
      book.details = {};
    }

    book.details.authorName =
      (result.find((r) => r.name === "authorName")?.value as string) ||
      undefined;
    book.details.isbn =
      (result.find((r) => r.name === "isbn")?.value as string) || undefined;
    book.details.dedication =
      (result.find((r) => r.name === "dedication")?.value as string) ||
      undefined;
    book.details.acknowledgements =
      (result.find((r) => r.name === "acknowledgements")?.value as string) ||
      undefined;
    book.details.aboutTheAuthor =
      (result.find((r) => r.name === "aboutTheAuthor")?.value as string) ||
      undefined;

    // Remove empty fields
    if (!book.details.authorName) delete book.details.authorName;
    if (!book.details.isbn) delete book.details.isbn;
    if (!book.details.dedication) delete book.details.dedication;
    if (!book.details.acknowledgements) delete book.details.acknowledgements;
    if (!book.details.aboutTheAuthor) delete book.details.aboutTheAuthor;

    // If details object is empty, remove it entirely
    if (Object.keys(book.details).length === 0) {
      delete book.details;
    }

    // Save changes
    await fetch(`/api/book/${book.id}/save`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(book),
    });
    window.location.reload();
  });
}
