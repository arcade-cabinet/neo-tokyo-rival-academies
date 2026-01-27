/**
 * Flooded World Design System
 *
 * Centralized design tokens and theming for consistent UI across the game.
 *
 * @example
 * ```tsx
 * import { useTheme, colors, typography } from '../design';
 *
 * function MyComponent() {
 *   const { colors, isDark, toggleMode } = useTheme();
 *   return <div style={{ background: colors.surface }}>...</div>;
 * }
 * ```
 */

// Design tokens
export {
	typography,
	colors,
	spacing,
	sizing,
	shadows,
	transitions,
	zIndex,
	breakpoints,
	tokens,
	getThemeColors,
	generateCSSVariables,
	type ThemeMode,
} from "./tokens";

// Theme hook
export { useTheme, createThemedStyles, type UseThemeReturn } from "./useTheme";
