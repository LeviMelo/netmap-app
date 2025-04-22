// src/utils/colorUtils.ts
/**
 * Utility functions for color manipulation.
 */

/**
 * Converts a valid CSS color string (hex, rgb, rgba) to an rgba string with a specified alpha.
 * Handles basic hex (#RGB, #RRGGBB) and rgb/rgba formats.
 * Provides fallbacks for invalid input.
 *
 * @param color - The input color string (e.g., '#ff0000', 'rgb(255,0,0)').
 * @param alpha - The desired alpha value (0.0 to 1.0).
 * @returns An rgba string (e.g., 'rgba(255,0,0,0.5)') or a fallback rgba gray if parsing fails.
 */
export const toRgbaString = (color: string, alpha: number): string => {
    if (typeof color !== 'string' || !color) {
        // Handle null, undefined, or non-string input gracefully
        console.warn(`Invalid color input to toRgbaString: ${color}. Using fallback.`);
        return `rgba(128, 128, 128, ${Math.max(0, Math.min(1, alpha))})`;
    }

    // Clamp alpha
    const validAlpha = Math.max(0, Math.min(1, alpha));
    const trimmedColor = color.trim();

    // Handle HEX (#RRGGBB or #RGB)
    if (trimmedColor.startsWith('#')) {
        let hex = trimmedColor.slice(1);
        if (hex.length === 3) {
            hex = hex.split('').map(char => char + char).join('');
        }
        if (hex.length === 6) {
            try {
                const r = parseInt(hex.substring(0, 2), 16);
                const g = parseInt(hex.substring(2, 4), 16);
                const b = parseInt(hex.substring(4, 6), 16);
                 if (!isNaN(r) && !isNaN(g) && !isNaN(b)) {
                     return `rgba(${r},${g},${b},${validAlpha})`;
                 }
            } catch (e) { /* Fall through if parsing fails */ }
        }
    }

    // Handle RGB (rgb(r, g, b)) - allow spaces around numbers
    const rgbMatch = trimmedColor.match(/^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i);
    if (rgbMatch) {
         try {
            const r = parseInt(rgbMatch[1], 10);
            const g = parseInt(rgbMatch[2], 10);
            const b = parseInt(rgbMatch[3], 10);
             if (!isNaN(r) && !isNaN(g) && !isNaN(b)) {
                 return `rgba(${r},${g},${b},${validAlpha})`;
             }
         } catch (e) { /* Fall through */ }
    }

    // Handle RGBA (rgba(r, g, b, a)) - just update alpha
     const rgbaMatch = trimmedColor.match(/^rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([\d.]+)\s*\)$/i);
     if (rgbaMatch) {
          try {
            const r = parseInt(rgbaMatch[1], 10);
            const g = parseInt(rgbaMatch[2], 10);
            const b = parseInt(rgbaMatch[3], 10);
            // Ignore original alpha (rgbaMatch[4]), use the new validAlpha
            if (!isNaN(r) && !isNaN(g) && !isNaN(b)) {
                return `rgba(${r},${g},${b},${validAlpha})`;
            }
          } catch(e) { /* Fall through */ }
     }

    // Fallback if no format matched or parsing failed
    console.warn(`Could not parse color '${trimmedColor}' to add alpha. Using fallback.`);
    return `rgba(128, 128, 128, ${validAlpha})`; // Return a default gray with alpha
};

// Add other color utils here later if needed (e.g., lighten, darken)