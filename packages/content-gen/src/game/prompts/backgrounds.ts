export const BACKGROUND_PROMPT_TEMPLATE = `
Generate a prompt for Imagen 4 to create a seamless, looping parallax background layer.
CONTEXT: Neo-Tokyo Cyberpunk JRPG.
REGION: {region_name}
THEME: {theme}
LAYER: {layer_type} (e.g., Far Skyline, Mid-ground Skyscrapers, Near Rooftops, Fog)

REQUIREMENTS:
- Seamless horizontal tiling.
- Cel-shaded anime style.
- Neon color palette: {palette}.
- Output format: Detailed image generation prompt string.
`;

export const ICON_PROMPT_TEMPLATE = `
Generate a prompt for Imagen 4 to create a UI Icon.
TYPE: {icon_type} (e.g., Weapon, Item, Ability)
NAME: {item_name}
STYLE: Minimalist, Neon, Cyberpunk UI.
Output format: Detailed image generation prompt string.
`;
