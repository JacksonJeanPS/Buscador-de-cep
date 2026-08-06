const HISTORY_KEY = "cep-explorer-history";
const MAX_HISTORY = 20;

export function getHistory() {
    try {
        return JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
    } catch {
        return [];
    }
}

export function addToHistory(item) {
    const history = getHistory();
    const existingIndex = history.findIndex((h) => h.cep === item.cep);
    if (existingIndex !== -1) {
        history.splice(existingIndex, 1);
    }

    history.unshift({
        ...item,
        timestamp: Date.now()
    });

    const trimmed = history.slice(0, MAX_HISTORY);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
}

export function removeFromHistory(cep) {
    const history = getHistory().filter((h) => h.cep !== cep);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

export function clearHistory() {
    localStorage.removeItem(HISTORY_KEY);
}
