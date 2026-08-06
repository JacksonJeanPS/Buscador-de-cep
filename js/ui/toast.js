const TOAST_KEY = "cep-explorer-toast";

export function showToast(message, duration = 3000) {
    const container = document.getElementById("toast-container");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = message;
    container.appendChild(toast);

    requestAnimationFrame(() => {
        toast.classList.add("show");
    });

    setTimeout(() => {
        toast.classList.remove("show");
        toast.addEventListener("transitionend", () => {
            toast.remove();
        });
    }, duration);
}

export function showCopyToast() {
    showToast("Endereço copiado para a área de transferência!", 2500);
}

export function showShareToast() {
    showToast("Link compartilhado com sucesso!", 2500);
}

export function showFavoriteToast(favorited) {
    showToast(favorited ? "Adicionado aos favoritos!" : "Removido dos favoritos!", 2500);
}
