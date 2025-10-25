export const PageBody = (): string => `
    <div class="loading-overlay">
        <div class="loader"></div>
        <div class="loading-text">Working...</div>
    </div>
    <main id="app"></main>
    <script type="module" src="/app.js"></script>
`;
