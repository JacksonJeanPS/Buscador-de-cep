const FAVORITES_KEY = "cep-explorer-favorites";

export function getFavorites() {
    try {
        return JSON.parse(localStorage.getItem(FAVORITES_KEY)) || [];
    } catch {
        return [];
    }
}

export function isFavorite(cep) {
    return getFavorites().some((f) => f.cep === cep);
}

export function toggleFavorite(item) {
    const favorites = getFavorites();
    const index = favorites.findIndex((f) => f.cep === item.cep);

    if (index !== -1) {
        favorites.splice(index, 1);
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
        return false;
    } else {
        favorites.unshift({
            ...item,
            favoritedAt: Date.now()
        });
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
        return true;
    }
}

export function removeFavorite(cep) {
    const favorites = getFavorites().filter((f) => f.cep !== cep);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
}
