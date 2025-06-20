export function showAlert(message: string): void {
    // Create alert element
    const alert: HTMLDivElement = document.createElement('div');
    alert.textContent = message;
    alert.style.cssText = `
      position: fixed;
      bottom: var(--size-large);
      right: 50%;
      transform: translateX(-50%);
      background-color: var(--color-primary-surface);
      color: var(--color-primary-text);
      padding: var(--size-small) var(--size-medium);
      border-radius: var(--radius);
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
      z-index: 1000;
      opacity: 0;
      transition: opacity 0.3s ease;
    `;

    // Add to document
    document.body.appendChild(alert);

    // Fade in animation
    setTimeout(() => {
        alert.style.opacity = '1';
    }, 10);

    // Remove after 3 seconds
    setTimeout(() => {
        alert.style.opacity = '0';
        setTimeout(() => {
            document.body.removeChild(alert);
        }, 300);
    }, 1500);
}
