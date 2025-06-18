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
`

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
`