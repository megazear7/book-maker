import { saveIcon } from "./icon.js";

export interface ModalPartInput {
  name: string;
  label: string;
  placeholder?: string;
  type: "plaintext" | "boolean" | "number" | "dropdown";
  options?: { label: string; value: string }[];
  default?: string;
  showIf?: {
    fieldName: string;
    value: string | boolean | number;
  };
}

export interface ModalPartParagraph {
  name: string;
  text: string;
  type: "paragraph";
  showIf?: {
    fieldName: string;
    value: string | boolean | number;
  };
}

export type ModalPart = ModalPartInput | ModalPartParagraph;

export interface ModalSubmitDetail {
  name: string;
  value: string | boolean | number;
}

export function createModal(
  title: string,
  buttonLabel: string,
  parts: ModalPart[],
  onSubmit: (details: ModalSubmitDetail[]) => void,
): void {
  // Create modal container
  const modal: HTMLDivElement = document.createElement("div");
  modal.id = "customModal";
  modal.className = "custom-modal";

  // Create modal content
  const modalContent: HTMLDivElement = document.createElement("div");
  modalContent.className = "modal-content";

  // Add title
  const modalTitle: HTMLHeadingElement = document.createElement("h2");
  modalTitle.textContent = title;
  modalTitle.className = "modal-title";
  modalContent.appendChild(modalTitle);

  // Create form
  const form: HTMLFormElement = document.createElement("form");
  form.className = "modal-form";

  // Add styles for the switch and paragraph
  const style: HTMLStyleElement = document.createElement("style");
  style.textContent = `
        .switch-container {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .switch {
            position: relative;
            display: inline-block;
            width: 50px;
            height: 24px;
        }
        .switch input {
            opacity: 0;
            width: 0;
            height: 0;
        }
        .slider {
            position: absolute;
            cursor: pointer;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: #ccc;
            transition: 0.4s;
            border-radius: 24px;
        }
        .slider:before {
            position: absolute;
            content: "";
            height: 20px;
            width: 20px;
            left: 2px;
            bottom: 2px;
            background-color: white;
            transition: 0.4s;
            border-radius: 50%;
        }
        input:checked + .slider {
            background-color: #2196F3;
        }
        input:checked + .slider:before {
            transform: translateX(26px);
        }
        .paragraph {
            margin: 10px 0;
        }
    `;
  document.head.appendChild(style);

  // Map to store all part containers (inputs and paragraphs)
  const partElements: Map<
    string,
    { input?: HTMLInputElement | HTMLSelectElement; container: HTMLDivElement }
  > = new Map();

  // Function to update field visibility
  const updateVisibility = (): void => {
    parts.forEach((part) => {
      const partData = partElements.get(part.name);
      if (!partData) return; // Skip if no container found
      const { container } = partData;

      if (part.showIf) {
        const dependentField = partElements.get(part.showIf.fieldName);
        if (dependentField && dependentField.input) {
          let dependentValue: string | boolean | number =
            dependentField.input.value;
          if (dependentField.input.type === "checkbox") {
            dependentValue = dependentField.input.checked;
          } else if (dependentField.input.type === "number") {
            dependentValue = dependentField.input.value
              ? Number(dependentField.input.value)
              : 0;
          }
          container.classList.toggle(
            "hidden",
            dependentValue !== part.showIf.value,
          );
        } else {
          container.classList.add("hidden");
        }
      } else {
        container.classList.remove("hidden");
      }
    });
  };

  // Add parts (inputs or paragraphs) with labels
  parts.forEach((part: ModalPart) => {
    const partContainer: HTMLDivElement = document.createElement("div");
    partContainer.className = "part-container";
    partContainer.dataset.name = part.name;

    // Add label
    const label: HTMLLabelElement = document.createElement("label");
    label.textContent =
      part.type === "paragraph"
        ? ""
        : (part as ModalPartInput).label.toUpperCase();
    label.className = "field-label";
    label.htmlFor = part.name;
    partContainer.appendChild(label);

    if (part.type === "paragraph") {
      const paragraph: HTMLParagraphElement = document.createElement("p");
      paragraph.className = "paragraph";
      paragraph.textContent = (part as ModalPartParagraph).text || "";
      partContainer.appendChild(paragraph);
      partElements.set(part.name, { container: partContainer });
    } else {
      // Add input based on type
      const inputPart = part as ModalPartInput;
      let input: HTMLInputElement | HTMLSelectElement;
      if (inputPart.type === "boolean") {
        const switchContainer: HTMLDivElement = document.createElement("div");
        switchContainer.className = "switch-container";

        const switchWrapper: HTMLLabelElement = document.createElement("label");
        switchWrapper.className = "switch";

        input = document.createElement("input");
        input.type = "checkbox";
        input.name = inputPart.name;
        input.id = inputPart.name;

        const slider: HTMLSpanElement = document.createElement("span");
        slider.className = "slider";

        switchWrapper.appendChild(input);
        switchWrapper.appendChild(slider);

        const switchLabel: HTMLSpanElement = document.createElement("span");
        switchLabel.className = "switch-label";
        if (input instanceof HTMLInputElement) {
          switchLabel.textContent = input.checked ? "ON" : "OFF";
          input.addEventListener("change", () => {
            if (input instanceof HTMLInputElement) {
              switchLabel.textContent = input.checked ? "ON" : "OFF";
            }
            updateVisibility();
          });
        }

        switchContainer.appendChild(switchWrapper);
        switchContainer.appendChild(switchLabel);
        partContainer.appendChild(switchContainer);
      } else if (inputPart.type === "dropdown") {
        const select = document.createElement("select");
        select.name = inputPart.name;
        select.id = inputPart.name;
        select.className = "modal-input";
        if (inputPart.options) {
          let hasDefault = false;
          inputPart.options.forEach((opt) => {
            const option = document.createElement("option");
            option.value = opt.value;
            option.textContent = opt.label;
            if (inputPart.default && inputPart.default === opt.value) {
              option.selected = true;
              hasDefault = true;
            }
            select.appendChild(option);
          });
          // If default value is set and not in options, add it as an extra option
          if (inputPart.default && !hasDefault) {
            const option = document.createElement("option");
            option.value = inputPart.default;
            option.textContent = inputPart.default + " (current)";
            option.selected = true;
            select.appendChild(option);
          }
        }
        select.addEventListener("change", updateVisibility);
        input = select;
        partContainer.appendChild(select);
      } else {
        input = document.createElement("input");
        input.type = inputPart.type === "number" ? "number" : "text";
        input.name = inputPart.name;
        input.id = inputPart.name;
        if (
          inputPart.placeholder &&
          (inputPart.type === "plaintext" || inputPart.type === "number")
        ) {
          input.placeholder = inputPart.placeholder;
        }
        if (inputPart.type === "plaintext" && inputPart.default !== undefined) {
          input.value = inputPart.default;
        }
        if (inputPart.type === "number" && inputPart.default !== undefined) {
          input.value = inputPart.default;
        }
        input.className = "modal-input";
        if (inputPart.type === "number") {
          // Prevent non-numeric input
          input.addEventListener("input", (e: Event) => {
            const target = e.target as HTMLInputElement;
            target.value = target.value.replace(/[^0-9.-]/g, "");
            updateVisibility();
          });
        } else {
          input.addEventListener("input", updateVisibility);
        }
        partContainer.appendChild(input);
      }

      partElements.set(inputPart.name, { input, container: partContainer });
    }

    form.appendChild(partContainer);
  });

  // Initial visibility update
  updateVisibility();

  // Create modal footer for save button
  const modalFooter: HTMLDivElement = document.createElement("div");
  modalFooter.className = "modal-footer";
  // Add submit button
  const submitButton: HTMLButtonElement = document.createElement("button");
  submitButton.type = "button";
  submitButton.className = "submit-button primary";
  const submitSpan: HTMLSpanElement = document.createElement("span");
  submitSpan.innerHTML = saveIcon + " " + buttonLabel;
  submitSpan.className = "button-inner";
  submitButton.appendChild(submitSpan);
  modalFooter.appendChild(submitButton);

  // Assemble modal
  modalContent.appendChild(form);
  modalContent.appendChild(modalFooter);
  modal.appendChild(modalContent);
  document.body.appendChild(modal);
  // Add open class after modal is in DOM for transition
  setTimeout(() => modal.classList.add("open"), 10);

  // Handle button click
  submitButton.addEventListener("click", () => {
    const inputs: NodeListOf<HTMLInputElement | HTMLSelectElement> =
      form.querySelectorAll("input, select");
    const result: ModalSubmitDetail[] = Array.from(inputs)
      .filter(
        (input) =>
          !input.closest(".part-container")?.classList.contains("hidden"),
      )
      .map((input: HTMLInputElement | HTMLSelectElement) => {
        let value: string | boolean | number = input.value;
        if (input instanceof HTMLInputElement && input.type === "checkbox") {
          value = input.checked;
        } else if (
          input instanceof HTMLInputElement &&
          input.type === "number"
        ) {
          value = input.value ? Number(input.value) : 0;
        }
        return {
          name: input.name,
          value,
        };
      });

    // Call the provided callback
    onSubmit(result);

    // Remove modal and open class
    modal.classList.remove("open");
    setTimeout(() => modal.remove(), 300);
  });

  // Close modal on click outside
  modal.addEventListener("click", (e: MouseEvent) => {
    if (e.target === modal) {
      modal.classList.remove("open");
      setTimeout(() => modal.remove(), 300);
    }
  });
}

export function getExpectedStringValue(
  result: ModalSubmitDetail[],
  fieldName: string,
): string {
  const field = result.find((entry) => entry.name === fieldName);

  if (field != undefined && typeof field.value === "string") {
    return field.value;
  } else {
    throw new Error("No string value found for field with name: " + fieldName);
  }
}

export function getExpectedBooleanValue(
  result: ModalSubmitDetail[],
  fieldName: string,
): boolean {
  const field = result.find((entry) => entry.name === fieldName);

  if (field != undefined && typeof field.value === "boolean") {
    return field.value;
  } else {
    throw new Error("No boolean value found for field with name: " + fieldName);
  }
}

export function getExpectedNumberValue(
  result: ModalSubmitDetail[],
  fieldName: string,
): number {
  const field = result.find((entry) => entry.name === fieldName);

  if (field != undefined && typeof field.value === "string") {
    return parseInt(field.value);
  } else {
    throw new Error("No number value found for field with name: " + fieldName);
  }
}
