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
