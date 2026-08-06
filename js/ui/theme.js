const THEME_KEY = "cep-explorer-theme";

export function initTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const theme = saved || (prefersDark ? "dark" : "light");
    applyTheme(theme);

    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
        if (!localStorage.getItem(THEME_KEY)) {
            applyTheme(e.matches ? "dark" : "light");
        }
    });
}

export function toggleTheme() {
    const current = document.documentElement.getAttribute("data-theme");
    const next = current === "dark" ? "light" : "dark";
    applyTheme(next);
    localStorage.setItem(THEME_KEY, next);
}

function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
}

export function getTheme() {
    return document.documentElement.getAttribute("data-theme") || "light";
}
