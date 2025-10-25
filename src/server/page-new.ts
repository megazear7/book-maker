export const PageNew = (body: string): string => `
<!DOCTYPE html>
<html>
    <head>
        <title>Book Maker New</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="/app.css">
        <script type="importmap">
            {
                "imports": {
                }
            }
        </script>
    </head>
    <body>
        ${body}
    </body>
</html>
`;
