export default (body: string) => `
<!DOCTYPE html>
<html>
    <head>
        <title>Whipo Template</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="/app.css">

        <script type="importmap">
            {
                "imports": {
                    "zod": "https://cdn.jsdelivr.net/npm/zod@3.23.8/+esm"
                }
            }
        </script>
    </head>
    <body>
        <div class="loading-overlay">
            <div class="loader"></div>
            <div class="loading-text">Working...</div>
        </div>
        ${body}
        <script type="module" src="/app.js"></script>
    </body>
</html>
`;
