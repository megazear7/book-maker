export const aiIconRight = `
<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <!-- Define a reusable star shape -->
  <defs>
    <symbol id="star" viewBox="0 0 100 100">
      <polygon points="50,15 61,38 87,38 66,55 74,80 50,65 26,80 34,55 13,38 39,38" />
    </symbol>
  </defs>

  <!-- Central star (largest) -->
  <use href="#star" x="0" y="0" width="60" height="66" transform="translate(40,17)" fill="#FFFFFF"/>

  <!-- Top star (left-adjusted) -->
  <use href="#star" x="0" y="0" width="40" height="43" transform="translate(25,0)" fill="#FFFFFF"/>

  <!-- Bottom-left star (moved up and left) -->
  <use href="#star" x="0" y="0" width="40" height="43" transform="translate(20,57)" fill="#FFFFFF"/>
</svg>
`;

export const aiIconLeft = `
<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <!-- Define a reusable star shape -->
  <defs>
    <symbol id="star" viewBox="0 0 100 100">
      <polygon points="50,15 61,38 87,38 66,55 74,80 50,65 26,80 34,55 13,38 39,38" />
    </symbol>
  </defs>

  <!-- Flip the entire group horizontally using scale and translate -->
  <g transform="scale(-1,1) translate(-100,0)">
    <!-- Central star (largest) -->
    <use href="#star" x="0" y="0" width="60" height="66" transform="translate(40,17)" fill="#FFFFFF"/>

    <!-- Top star (left-adjusted) -->
    <use href="#star" x="0" y="0" width="40" height="43" transform="translate(25,0)" fill="#FFFFFF"/>

    <!-- Bottom-left star (moved up and left) -->
    <use href="#star" x="0" y="0" width="40" height="43" transform="translate(20,57)" fill="#FFFFFF"/>
  </g>
</svg>
`;

export const plusIcon = `
<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
  <rect x="10" y="4" width="4" height="16" />
  <rect x="4" y="10" width="16" height="4" />
</svg>
`;

export const downloadIcon = `
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M12 3V16M12 16L7 11M12 16L17 11" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M4 21H20" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
</svg>
`;

export const trashIcon = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <polyline points="3 6 5 6 21 6" />
  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
  <path d="M10 11v6" />
  <path d="M14 11v6" />
  <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
</svg>
`;

export const audioIcon = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <polygon points="4 9 8 9 13 5 13 19 8 15 4 15 4 9" />
  <path d="M16 8c1.333 1.333 1.333 6.667 0 8" />
  <path d="M19 5c2.667 2.667 2.667 11.333 0 14" />
</svg>
`;

export const gearIcon = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="64" height="64" fill="currentColor" aria-hidden="true">
  <path d="M19.43 12.98c.04-.32.07-.65.07-.98s-.03-.66-.07-.98l2.11-1.65a.5.5 0 0 0 .12-.64l-2-3.46a.5.5 0 0 0-.61-.22l-2.49 1a7.03 7.03 0 0 0-1.69-.98l-.38-2.65A.5.5 0 0 0 14 0h-4a.5.5 0 0 0-.5.42l-.38 2.65c-.62.24-1.19.56-1.69.98l-2.49-1a.5.5 0 0 0-.61.22l-2 3.46a.5.5 0 0 0 .12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98L2.46 14.63a.5.5 0 0 0-.12.64l2 3.46c.14.24.43.34.7.22l2.49-1c.5.42 1.07.75 1.69.98l.38 2.65c.04.27.26.42.5.42h4c.24 0 .46-.15.5-.42l.38-2.65c.62-.24 1.19-.56 1.69-.98l2.49 1c.27.12.56.02.7-.22l2-3.46a.5.5 0 0 0-.12-.64l-2.11-1.65ZM12 15.5A3.5 3.5 0 1 1 12 8.5a3.5 3.5 0 0 1 0 7Z"/>
</svg>
`;

export const saveIcon = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="64" height="64" fill="currentColor" aria-hidden="true">
  <path d="M20.3 6.7a1 1 0 0 0-1.4 0L10 15.6l-4.9-4.9a1 1 0 0 0-1.4 1.4l5.6 5.6a1 1 0 0 0 1.4 0l9.6-9.6a1 1 0 0 0 0-1.4z"/>
</svg>
`;

export const homeIcon = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true">
  <path d="M12 3 2 12h3v9h6v-6h2v6h6v-9h3L12 3z"/>
</svg>
`;

export const xIcon = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true">
  <path d="M18.3 5.7a1 1 0 0 0-1.4 0L12 10.6 7.1 5.7a1 1 0 0 0-1.4 1.4L10.6 12l-4.9 4.9a1 1 0 1 0 1.4 1.4L12 13.4l4.9 4.9a1 1 0 0 0 1.4-1.4L13.4 12l4.9-4.9a1 1 0 0 0 0-1.4z"/>
</svg>
`;

export const refreshIcon = `
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M17.65 6.35A7.958 7.958 0 0 0 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0 1 12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" fill="currentColor"/>
</svg>
`;

export const detailsIcon = `
<svg xmlns="http://www.w3.org/2000/svg"
     width="24" height="24" viewBox="0 0 24 24"
     role="img" aria-label="Details" fill="none"
     stroke="currentColor" stroke-width="1.6"
     stroke-linecap="round" stroke-linejoin="round">
  <title>Details</title>

  <!-- bullets -->
  <circle cx="5"  cy="6"  r="0.9" />
  <circle cx="5"  cy="12" r="0.9" />
  <circle cx="5"  cy="18" r="0.9" />

  <!-- list lines -->
  <path d="M9 6h7" />
  <path d="M9 12h7" />
  <path d="M9 18h7" />

  <!-- chevron (indicates 'more details') -->
  <path d="M19 10.7 L20.7 12 L19 13.3" />
</svg>
`;

export const editIcon = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="100%" height="100%" role="img" aria-label="Pencil icon">
  <path fill="currentColor" d="M3 17.2V21h3.8l11-11.1-3.8-3.8L3 17.2zM20.7 7.0c.4-.4.4-1.1 0-1.5l-2.2-2.2c-.4-.4-1.1-.4-1.5 0L15 4.3l3.8 3.8 1.9-1.1z"/>
</svg>
`;
