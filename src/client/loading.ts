import { LoadingMessageContent, LoadingMessages } from "../types/book.type.js";

async function getLoadingMessages(
  content: LoadingMessageContent,
): Promise<LoadingMessages> {
  const res = await fetch(`/api/loading/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ content }),
  });
  const json = await res.json();
  return LoadingMessages.parse(json);
}

let isLoading = false;
let cleanupFunction: (() => void) | null = null;

export async function toggleLoading(
  content: LoadingMessageContent,
  messageDelay: number = 10000,
): Promise<() => void> {
  // If already loading, trigger cleanup with animation
  if (isLoading && cleanupFunction) {
    const loadingDiv = document.querySelector(
      ".loading-container",
    ) as HTMLDivElement;
    if (loadingDiv) {
      loadingDiv.style.animation = "fadeOut 0.5s ease-out forwards";
      loadingDiv.style.transformOrigin = "center";
      await new Promise((resolve) => setTimeout(resolve, 500)); // Wait for animation
      cleanupFunction();
    }
    isLoading = false;
    cleanupFunction = null;
    return () => {};
  }

  isLoading = true;

  // Create loading container
  const loadingDiv: HTMLDivElement = document.createElement("div");
  loadingDiv.className = "loading-container";
  loadingDiv.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      z-index: 9999;
      animation: fadeIn 0.5s ease-in;
  `;

  // Create spinner
  const spinner: HTMLDivElement = document.createElement("div");
  spinner.style.cssText = `
      width: 50px;
      height: 50px;
      border: 5px solid var(--color-1, #fff);
      border-top: 5px solid var(--color-2, #3498db);
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 20px;
  `;

  // Create message container
  const messageDiv: HTMLDivElement = document.createElement("div");
  messageDiv.style.cssText = `
      color: white;
      font-family: Arial, sans-serif;
      font-size: 24px;
      text-align: center;
      max-width: 80%;
  `;
  messageDiv.textContent = "Working";

  // Add spinner and fade animations keyframes
  const styleSheet: HTMLStyleElement = document.createElement("style");
  styleSheet.textContent = `
      @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
      }
      @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
      }
      @keyframes fadeOut {
          from { opacity: 1; transform: scale(1) rotate(0deg); }
          to { opacity: 0; transform: scale(1.2) rotate(180deg); }
      }
  `;
  document.head.appendChild(styleSheet);

  // Append elements
  loadingDiv.appendChild(spinner);
  loadingDiv.appendChild(messageDiv);
  document.body.appendChild(loadingDiv);

  // Fetch messages and start rotation
  let currentMessageIndex: number = 0;
  let messageInterval: NodeJS.Timeout | null = null;

  try {
    const messages: string[] = await getLoadingMessages(content);
    if (messages.length > 0) {
      messageDiv.textContent = messages[currentMessageIndex];
      messageInterval = setInterval(() => {
        currentMessageIndex = (currentMessageIndex + 1) % messages.length;
        messageDiv.textContent = messages[currentMessageIndex];
      }, messageDelay);
    }
  } catch (error) {
    console.error("Failed to load messages:", error);
    messageDiv.textContent = "Working...";
  }

  // Store cleanup function
  cleanupFunction = function cleanup(): void {
    if (messageInterval) clearInterval(messageInterval);
    loadingDiv.remove();
    styleSheet.remove();
    isLoading = false;
    cleanupFunction = null;
  };

  return cleanupFunction;
}
