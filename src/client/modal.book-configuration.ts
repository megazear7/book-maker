import { Book } from "../types/book.type.js";
import { createModal, ModalPartInput } from "./service.modal.js";

export async function openBookConfigurationModal(book: Book): Promise<void> {
  try {
    // Fetch available models from the API
    const response = await fetch("/api/models");
    const data = await response.json();

    let modelOptions: { label: string; value: string }[];

    if (data.models && data.models.length > 0) {
      modelOptions = data.models.map((model: string) => ({
        label: model.toUpperCase(),
        value: model,
      }));
    } else {
      // If no models found, show a message and allow free text input
      modelOptions = [];
      alert(
        data.message ||
          "No model API keys configured. You can still enter a model name manually.",
      );
    }

    const fields: ModalPartInput[] = [
      {
        name: "textModelName",
        label: "Text Model Name",
        type: modelOptions.length > 0 ? "dropdown" : "plaintext",
        options: modelOptions,
        default:
          typeof book.model.text.name === "string" ? book.model.text.name : "",
      },
      {
        name: "textEndpoint",
        label: "Text Model Endpoint",
        type: "plaintext",
        default: book.model.text.endpoint ?? "",
      },
      {
        name: "textModelNameField",
        label: "Text Model Name",
        type: "plaintext",
        default: book.model.text.modelName ?? "",
      },
      {
        name: "textDeployment",
        label: "Text Model Deployment",
        type: "plaintext",
        default: book.model.text.deployment ?? "",
        showIf: {
          fieldName: "textModelName",
          value: "azure",
        },
      },
      {
        name: "audioModelName",
        label: "Audio Model Name",
        type: modelOptions.length > 0 ? "dropdown" : "plaintext",
        options: modelOptions,
        default:
          typeof book.model.audio.name === "string"
            ? book.model.audio.name
            : "",
      },
      {
        name: "audioEndpoint",
        label: "Audio Model Endpoint",
        type: "plaintext",
        default: book.model.audio.endpoint ?? "",
      },
      {
        name: "audioModelNameField",
        label: "Audio Model Name",
        type: "plaintext",
        default: book.model.audio.modelName ?? "",
      },
      {
        name: "audioDeployment",
        label: "Audio Model Deployment",
        type: "plaintext",
        default: book.model.audio.deployment ?? "",
        showIf: {
          fieldName: "audioModelName",
          value: "azure",
        },
      },
      // Text model cost fields
      {
        name: "textInputTokenCost",
        label: "Text Input Token Cost",
        type: "plaintext",
        default: String(book.model.text.cost.inputTokenCost ?? ""),
      },
      {
        name: "textInputTokenCount",
        label: "Text Input Token Count",
        type: "plaintext",
        default: String(book.model.text.cost.inputTokenCount ?? ""),
      },
      {
        name: "textOutputTokenCost",
        label: "Text Output Token Cost",
        type: "plaintext",
        default: String(book.model.text.cost.outputTokenCost ?? ""),
      },
      {
        name: "textOutputTokenCount",
        label: "Text Output Token Count",
        type: "plaintext",
        default: String(book.model.text.cost.outputTokenCount ?? ""),
      },
      // Audio model cost fields
      {
        name: "audioInputTokenCost",
        label: "Audio Input Token Cost",
        type: "plaintext",
        default: String(book.model.audio.cost.inputTokenCost ?? ""),
      },
      {
        name: "audioInputTokenCount",
        label: "Audio Input Token Count",
        type: "plaintext",
        default: String(book.model.audio.cost.inputTokenCount ?? ""),
      },
      {
        name: "audioOutputTokenCost",
        label: "Audio Output Token Cost",
        type: "plaintext",
        default: String(book.model.audio.cost.outputTokenCost ?? ""),
      },
      {
        name: "audioOutputTokenCount",
        label: "Audio Output Token Count",
        type: "plaintext",
        default: String(book.model.audio.cost.outputTokenCount ?? ""),
      },
    ];
    createModal("Configure Model", "Save", fields, async (result) => {
      // Update book.model with new values
      const textModelName = String(
        result.find((r) => r.name === "textModelName")?.value ?? "",
      );
      const audioModelName = String(
        result.find((r) => r.name === "audioModelName")?.value ?? "",
      );
      const textEndpoint = String(
        result.find((r) => r.name === "textEndpoint")?.value ?? "",
      );
      const textModelNameField = String(
        result.find((r) => r.name === "textModelNameField")?.value ?? "",
      );
      const textDeployment = String(
        result.find((r) => r.name === "textDeployment")?.value ?? "",
      );
      const audioEndpoint = String(
        result.find((r) => r.name === "audioEndpoint")?.value ?? "",
      );
      const audioModelNameField = String(
        result.find((r) => r.name === "audioModelNameField")?.value ?? "",
      );
      const audioDeployment = String(
        result.find((r) => r.name === "audioDeployment")?.value ?? "",
      );

      book.model.text.name = textModelName;
      book.model.text.endpoint = textEndpoint;
      book.model.text.modelName = textModelNameField;
      if (textDeployment) {
        book.model.text.deployment = textDeployment;
      } else {
        delete book.model.text.deployment;
      }

      book.model.audio.name = audioModelName;
      book.model.audio.endpoint = audioEndpoint;
      book.model.audio.modelName = audioModelNameField;
      if (audioDeployment) {
        book.model.audio.deployment = audioDeployment;
      } else {
        delete book.model.audio.deployment;
      }

      // Update cost fields
      const textInputTokenCost = Number(
        result.find((r) => r.name === "textInputTokenCost")?.value ?? 0,
      );
      const textInputTokenCount = Number(
        result.find((r) => r.name === "textInputTokenCount")?.value ?? 0,
      );
      const textOutputTokenCost = Number(
        result.find((r) => r.name === "textOutputTokenCost")?.value ?? 0,
      );
      const textOutputTokenCount = Number(
        result.find((r) => r.name === "textOutputTokenCount")?.value ?? 0,
      );
      const audioInputTokenCost = Number(
        result.find((r) => r.name === "audioInputTokenCost")?.value ?? 0,
      );
      const audioInputTokenCount = Number(
        result.find((r) => r.name === "audioInputTokenCount")?.value ?? 0,
      );
      const audioOutputTokenCost = Number(
        result.find((r) => r.name === "audioOutputTokenCost")?.value ?? 0,
      );
      const audioOutputTokenCount = Number(
        result.find((r) => r.name === "audioOutputTokenCount")?.value ?? 0,
      );

      book.model.text.cost.inputTokenCost = textInputTokenCost;
      book.model.text.cost.inputTokenCount = textInputTokenCount;
      book.model.text.cost.outputTokenCost = textOutputTokenCost;
      book.model.text.cost.outputTokenCount = textOutputTokenCount;
      book.model.audio.cost.inputTokenCost = audioInputTokenCost;
      book.model.audio.cost.inputTokenCount = audioInputTokenCount;
      book.model.audio.cost.outputTokenCost = audioOutputTokenCost;
      book.model.audio.cost.outputTokenCount = audioOutputTokenCount;

      // Save changes
      await fetch(`/api/book/${book.id}/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(book),
      });
      window.location.reload();
    });
  } catch (error) {
    console.error("Error opening book configuration modal:", error);
  }
}
