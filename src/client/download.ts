export function downloadTextAsFile(element: HTMLElement, text: string, filename: string = 'download.txt'): void {
    try {
        // Ensure the environment supports required APIs
        if (!window || !window.URL || !window.Blob) {
            throw new Error('Browser does not support required APIs (Blob or URL)');
        }

        // Create a Blob with the text content
        const blob: Blob = new Blob([text], { type: 'text/plain' });

        // Generate a temporary URL for the Blob
        const url: string = window.URL.createObjectURL(blob);

        // Create a hidden anchor element
        const a: HTMLAnchorElement = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.addEventListener('click', (event: MouseEvent) => {
            event.preventDefault();
            event.stopPropagation();
        });
        a.innerText = "Download"

        // Append to the DOM
        element.insertAdjacentElement("afterend", a);

        // Trigger the download
        a.click();

        // Clean up after a short delay to ensure the download starts
        // setTimeout(() => {
        //     document.body.removeChild(a);
        //     window.URL.revokeObjectURL(url);
        // }, 100);
    } catch (error) {
        console.error('Failed to download file:', error);
        throw new Error(`Download failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

export function download(text: string, name = 'file.txt') {
    const blob = new Blob([text]);
    // Convert your blob into a Blob URL (a special url that points to an object in the browser's memory)
    const blobUrl = URL.createObjectURL(blob);

    // Create a link element
    const link = document.createElement("a");

    // Set link's href to point to the Blob URL
    link.href = blobUrl;
    link.download = name;
    link.classList.add("prevent-navigation");

    // Append link to the body
    document.body.appendChild(link);

    // Dispatch click event on the link
    // This is necessary as link.click() does not work on the latest firefox
    link.dispatchEvent(
        new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window
        })
    );

    // Remove link from body
    document.body.removeChild(link);
}
