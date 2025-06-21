export interface InputField {
    name: string;
    label: string;
    placeholder?: string;
    type: 'plaintext' | 'boolean' | 'number';
    showIf?: {
        fieldName: string;
        value: string | boolean | number;
    };
}

export interface ModalSubmitDetail {
    name: string;
    value: string | boolean | number;
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

    // Add styles for the switch
    const style: HTMLStyleElement = document.createElement('style');
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
    `;
    document.head.appendChild(style);

    // Map to store input elements for easy access
    const inputElements: Map<string, { input: HTMLInputElement; container: HTMLDivElement }> = new Map();

    // Function to update field visibility
    const updateVisibility = () => {
        inputFields.forEach((field) => {
            const { container } = inputElements.get(field.name)!;
            if (field.showIf) {
                const dependentField = inputElements.get(field.showIf.fieldName);
                if (dependentField) {
                    let dependentValue: string | boolean | number = dependentField.input.value;
                    if (dependentField.input.type === 'checkbox') {
                        dependentValue = dependentField.input.checked;
                    } else if (dependentField.input.type === 'number') {
                        dependentValue = dependentField.input.value ? Number(dependentField.input.value) : 0;
                    }

                    container.classList.toggle('hidden', dependentValue !== field.showIf.value);
                } else {
                    container.classList.add('hidden');
                }
            } else {
                container.classList.remove('hidden');
            }
        });
    };

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

        // Add input based on type
        let input: HTMLInputElement;
        if (field.type === 'boolean') {
            const switchContainer: HTMLDivElement = document.createElement('div');
            switchContainer.className = 'switch-container';

            const switchWrapper: HTMLLabelElement = document.createElement('label');
            switchWrapper.className = 'switch';

            input = document.createElement('input');
            input.type = 'checkbox';
            input.name = field.name;
            input.id = field.name;

            const slider: HTMLSpanElement = document.createElement('span');
            slider.className = 'slider';

            switchWrapper.appendChild(input);
            switchWrapper.appendChild(slider);

            const switchLabel: HTMLSpanElement = document.createElement('span');
            switchLabel.className = 'switch-label';
            switchLabel.textContent = input.checked ? 'ON' : 'OFF';

            input.addEventListener('change', () => {
                switchLabel.textContent = input.checked ? 'ON' : 'OFF';
                updateVisibility();
            });

            switchContainer.appendChild(switchWrapper);
            switchContainer.appendChild(switchLabel);
            inputContainer.appendChild(switchContainer);
        } else {
            input = document.createElement('input');
            input.type = field.type === 'number' ? 'number' : 'text';
            input.name = field.name;
            input.id = field.name;
            if (field.placeholder && (field.type === 'plaintext' || field.type === 'number')) {
                input.placeholder = field.placeholder;
            }
            input.className = 'modal-input';
            if (field.type === 'number') {
                // Prevent non-numeric input
                input.addEventListener('input', (e: Event) => {
                    const target = e.target as HTMLInputElement;
                    target.value = target.value.replace(/[^0-9.-]/g, '');
                    updateVisibility();
                });
            } else {
                input.addEventListener('input', updateVisibility);
            }
            inputContainer.appendChild(input);
        }

        form.appendChild(inputContainer);
        inputElements.set(field.name, { input, container: inputContainer });
    });

    // Initial visibility update
    updateVisibility();

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
        const result: ModalSubmitDetail[] = Array.from(inputs)
            .filter((input) => !input.closest('.input-container')?.classList.contains('hidden'))
            .map((input: HTMLInputElement) => {
                let value: string | boolean | number = input.value;
                if (input.type === 'checkbox') {
                    value = input.checked;
                } else if (input.type === 'number') {
                    value = input.value ? Number(input.value) : 0;
                }
                return {
                    name: input.name,
                    value
                };
            });

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

export function getExpectedStringValue(e: CustomEvent<ModalSubmitDetail[]>, fieldName: string): string {
    const field = e.detail.find(entry => entry.name === fieldName);

    if (field != undefined && typeof field.value === "string") {
        return field.value
    } else {
        throw new Error("No string value found for field with name: " + fieldName);
    }
}

export function getExpectedBooleanValue(e: CustomEvent<ModalSubmitDetail[]>, fieldName: string): boolean {
    const field = e.detail.find(entry => entry.name === fieldName);

    if (field != undefined && typeof field.value === "boolean") {
        return field.value
    } else {
        throw new Error("No boolean value found for field with name: " + fieldName);
    }
}

export function getExpectedNumberValue(e: CustomEvent<ModalSubmitDetail[]>, fieldName: string): number {
    const field = e.detail.find(entry => entry.name === fieldName);

    if (field != undefined && typeof field.value === "string") {
        return parseInt(field.value);
    } else {
        throw new Error("No number value found for field with name: " + fieldName);
    }
}
