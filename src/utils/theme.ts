import { extendTheme } from "@chakra-ui/react";
import { defineStyle, defineStyleConfig } from '@chakra-ui/react'

// define the base component styles
const baseStyle = {
  padding: '0.5rem',
  fontSize: "12px",
  borderRadius: "0.325rem",
  background: "black.700"
}

// export the component theme
export const tooltipTheme = defineStyleConfig({ baseStyle })

// 2. Extend the theme to include custom colors, fonts, etc
export const colors = {
  bgColor: "var(--vscode-textCodeBlock-background)",
  fgColor: "var(--vscode-foreground)",
  fontSize: "var(--vscode-editor-font-size)",
  black: {
    900: "#121212",
    800: "#181818",
    700: "#282828",
    600: "#404040"
  },
  text: {
    100: "#B3B3B3",
    200: "#FFF",
  },
};

export const components = {
  Tooltip: tooltipTheme,
}

export const theme = extendTheme({ colors, components });
