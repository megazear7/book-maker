export const Page = (body: string): string => `
<!DOCTYPE html>
<html>
    <head>
        <title>Book Maker Old</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="/app.css">

        <script type="importmap">
            {
                "imports": {
                    "zod": "https://cdn.jsdelivr.net/npm/zod@3.23.8/+esm",
                    "docx": "/node_modules/docx/dist/index.mjs"
                }
            }
        </script>
    </head>
    <body>
        ${body}
    </body>
</html>
`;
