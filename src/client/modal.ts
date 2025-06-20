export interface InputField {
    name: string;
    label: string;
    placeholder: string;
}

export interface ModalSubmitDetail {
    name: string;
    value: string;
}

declare global {
    interface DocumentEventMap {
        modalSubmit: CustomEvent<ModalSubmitDetail[]>;
    }
}

export function createModal(title: string, buttonLabel: string, inputFields: InputField[]): void {
    // Create modal container
    const modal: HTMLDivElement = document.createElement('div');
    modal.id = 'customModal';
    modal.className = 'custom-modal';

    // Create modal content
    const modalContent: HTMLDivElement = document.createElement('div');
    modalContent.className = 'modal-content';

    // Add title
    const modalTitle: HTMLHeadingElement = document.createElement('h2');
    modalTitle.textContent = title;
    modalTitle.className = 'modal-title';
    modalContent.appendChild(modalTitle);

    // Create form
    const form: HTMLFormElement = document.createElement('form');
    form.className = 'modal-form';

    // Add input fields with labels
    inputFields.forEach((field: InputField) => {
        const inputContainer: HTMLDivElement = document.createElement('div');
        inputContainer.className = 'input-container';

        // Add label
        const label: HTMLLabelElement = document.createElement('label');
        label.textContent = field.label.toUpperCase();
        label.className = 'field-label';
        label.htmlFor = field.name;
        inputContainer.appendChild(label);

        // Add input
        const input: HTMLInputElement = document.createElement('input');
        input.type = 'text';
        input.name = field.name;
        input.id = field.name;
        input.placeholder = field.placeholder;
        input.className = 'modal-input';
        inputContainer.appendChild(input);

        form.appendChild(inputContainer);
    });

    // Create button container
    const buttonContainer: HTMLDivElement = document.createElement('div');
    buttonContainer.className = 'button-container';

    // Add submit button
    const submitButton: HTMLButtonElement = document.createElement('button');
    submitButton.type = 'button';
    submitButton.textContent = buttonLabel;
    submitButton.className = 'submit-button';
    buttonContainer.appendChild(submitButton);

    // Assemble modal
    form.appendChild(buttonContainer);
    modalContent.appendChild(form);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    // Handle button click
    submitButton.addEventListener('click', () => {
        const inputs: NodeListOf<HTMLInputElement> = form.querySelectorAll('input');
        const result: ModalSubmitDetail[] = Array.from(inputs).map((input: HTMLInputElement) => ({
            name: input.name,
            value: input.value
        }));

        // Dispatch custom event
        const event: CustomEvent<ModalSubmitDetail[]> = new CustomEvent('modalSubmit', {
            detail: result,
            bubbles: true,
            cancelable: true
        });
        document.dispatchEvent(event);

        // Remove modal
        modal.remove();
    });

    // Close modal on click outside
    modal.addEventListener('click', (e: MouseEvent) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}
