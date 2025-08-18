export const themes = {
  tomorrow: {
    name: "Tomorrow",
    colors: {
      "--bg-primary": "#1d1f21",
      "--bg-secondary": "#282a2e",
      "--bg-tertiary": "#373b41",
      "--text-primary": "#c5c8c6",
      "--text-secondary": "#969896",
      "--text-muted": "#707880",
      "--border-color": "#242528",
      "--accent-color": "#81a2be",
      "--accent-hover": "#a3c1d9",
      "--danger-color": "#cc6666",
      "--danger-hover": "#d98888",
    },
  },
  gruvbox: {
    name: "Gruvbox",
    colors: {
      "--bg-primary": "#282828",
      "--bg-secondary": "#3c3836",
      "--bg-tertiary": "#504945",
      "--text-primary": "#ebdbb2",
      "--text-secondary": "#bdae93",
      "--text-muted": "#928374",
      "--border-color": "#3c3836",
      "--accent-color": "#83a598",
      "--accent-hover": "#8ec07c",
      "--danger-color": "#fb4934",
      "--danger-hover": "#cc241d",
    },
  },
  dracula: {
    name: "Dracula",
    colors: {
      "--bg-primary": "#282a36",
      "--bg-secondary": "#44475a",
      "--bg-tertiary": "#6272a4",
      "--text-primary": "#f8f8f2",
      "--text-secondary": "#bd93f9",
      "--text-muted": "#6272a4",
      "--border-color": "#44475a",
      "--accent-color": "#50fa7b",
      "--accent-hover": "#8be9fd",
      "--danger-color": "#ff5555",
      "--danger-hover": "#ff79c6",
    },
  },
  atom: {
    name: "Atom",
    colors: {
      "--bg-primary": "#282c34",
      "--bg-secondary": "#21252b",
      "--bg-tertiary": "#3c4048",
      "--text-primary": "#abb2bf",
      "--text-secondary": "#828997",
      "--text-muted": "#5c6370",
      "--border-color": "#21252b",
      "--accent-color": "#61afef",
      "--accent-hover": "#98c379",
      "--danger-color": "#e06c75",
      "--danger-hover": "#c678dd",
    },
  },
};

export const applyTheme = (themeName) => {
  const theme = themes[themeName];
  if (!theme) {
    console.warn(`Theme "${themeName}" not found.`);
    return;
  }
  const root = document.documentElement;
  Object.entries(theme.colors).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
  localStorage.setItem("theme", themeName);
};
