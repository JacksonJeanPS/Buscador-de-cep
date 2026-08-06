import { buscarEnderecoPorCep } from "../services/viaCepService.js";
import { geocodificarEndereco } from "../services/nominatimService.js";
import { buscarDadosMunicipio, buscarPopulacaoEstimada } from "../services/ibgeService.js";
import { buscarClima, interpretarCodigoClima, getIconeClima } from "../services/weatherService.js";
import {
    getGoogleMapsEmbedUrl,
    getGoogleStreetViewUrl,
    getOpenStreetMapEmbedUrl,
    getGoogleMapsLink
} from "../services/mapsService.js";
import { addToHistory, removeFromHistory, getHistory, clearHistory } from "./history.js";
import { toggleFavorite, isFavorite, removeFavorite, getFavorites } from "./favorites.js";
import { showToast, showCopyToast, showFavoriteToast } from "./toast.js";
import { toggleTheme, getTheme } from "./theme.js";

const GOOGLE_MAPS_API_KEY = "";

let currentData = null;
let currentCoords = null;
let currentWeather = null;
let currentIbge = null;

function getElements() {
    return {
        form: document.getElementById("searchForm"),
        input: document.getElementById("cepInput"),
        cepHelp: document.getElementById("cepHelp"),
        btnSearch: document.getElementById("btnSearch"),
        btnClear: document.getElementById("btnClear"),
        btnGeolocation: document.getElementById("btnGeolocation"),
        btnTheme: document.getElementById("btnTheme"),
        resultSection: document.getElementById("resultSection"),
        errorSection: document.getElementById("errorSection"),
        loadingSection: document.getElementById("loadingSection"),
        emptySection: document.getElementById("emptySection"),
        addressCard: document.getElementById("addressCard"),
        mapCard: document.getElementById("mapCard"),
        streetViewCard: document.getElementById("streetViewCard"),
        weatherCard: document.getElementById("weatherCard"),
        ibgeCard: document.getElementById("ibgeCard"),
        actionsCard: document.getElementById("actionsCard"),
        historySection: document.getElementById("historySection"),
        historyList: document.getElementById("historyList"),
        favoritesSection: document.getElementById("favoritesSection"),
        favoritesList: document.getElementById("favoritesList"),
        themeIcon: document.getElementById("themeIcon"),
        qrCodeContainer: document.getElementById("qrCodeContainer")
    };
}

export function init() {
    const els = getElements();
    if (!els.form) return;

    els.form.addEventListener("submit", (e) => {
        e.preventDefault();
        handleSearch(els.input.value);
    });

    els.input.addEventListener("input", () => {
        els.cepHelp.classList.remove("error");
    });

    els.btnClear.addEventListener("click", () => {
        clearResults(els);
        els.input.value = "";
        els.input.focus();
    });

    els.btnGeolocation.addEventListener("click", handleGeolocation);
    els.btnTheme.addEventListener("click", () => {
        toggleTheme();
        updateThemeIcon();
    });

    document.getElementById("btnRetry")?.addEventListener("click", () => {
        handleSearch(els.input.value);
    });

    document.getElementById("btnClearHistory")?.addEventListener("click", () => {
        clearHistory();
        renderHistory();
        showToast("Histórico limpo!");
    });

    renderHistory();
    renderFavorites();

    if (!currentData) {
        showEmpty(els);
    }
}

async function handleSearch(cepValue) {
    const els = getElements();
    const cep = cepValue.replace(/\D/g, "");

    if (!/^\d{8}$/.test(cep)) {
        els.cepHelp.classList.add("error");
        showError(els, "CEP inválido. Digite 8 números.");
        return;
    }

    els.cepHelp.classList.remove("error");

    showLoading(els);
    hideError(els);
    hideEmpty(els);

    try {
        const endereco = await buscarEnderecoPorCep(cep);
        currentData = endereco;

        let coords = null;
        try {
            coords = await geocodificarEndereco(endereco);
            currentCoords = coords;
        } catch (err) {
            console.warn("Geocodificação falhou:", err.message);
        }

        let weather = null;
        if (coords) {
            try {
                weather = await buscarClima(coords.lat, coords.lon);
                currentWeather = weather;
            } catch (err) {
                console.warn("Clima falhou:", err.message);
            }
        }

        let ibgeData = null;
        try {
            const dadosMunicipio = await buscarDadosMunicipio(endereco.uf, endereco.localidade);
            if (dadosMunicipio) {
                const populacao = await buscarPopulacaoEstimada(dadosMunicipio.codigoIbge);
                ibgeData = { ...dadosMunicipio, populacaoEstimada: populacao };
                currentIbge = ibgeData;
            }
        } catch (err) {
            console.warn("IBGE falhou:", err.message);
        }

        addToHistory({
            cep: endereco.cep,
            logradouro: endereco.logradouro,
            bairro: endereco.bairro,
            localidade: endereco.localidade,
            uf: endereco.uf
        });

        renderResults(els, endereco, coords, weather, ibgeData);
        renderHistory();
        renderFavorites();
    } catch (err) {
        showError(els, err.message || "Erro ao buscar CEP. Tente novamente.");
    }
}

function renderResults(els, endereco, coords, weather, ibgeData) {
    hideLoading(els);
    els.resultSection.classList.remove("hidden");

    renderAddressCard(els, endereco);
    renderMapCard(els, coords);
    renderStreetViewCard(els, coords);
    renderWeatherCard(els, weather);
    renderIbgeCard(els, ibgeData);
    renderActionsCard(els, endereco, coords);
    renderQRCode(endereco, coords);

    els.resultSection.scrollIntoView({ behavior: "smooth", block: "start" });
}

function renderAddressCard(els, endereco) {
    const labels = {
        cep: "CEP",
        logradouro: "Logradouro",
        complemento: "Complemento",
        bairro: "Bairro",
        localidade: "Cidade",
        uf: "Estado",
        ibge: "Código IBGE",
        gia: "GIA",
        ddd: "DDD",
        siafi: "SIAFI"
    };

    const linhas = Object.entries(endereco)
        .filter(([, valor]) => valor && valor.trim() !== "")
        .map(([chave, valor]) => `<div class="result-row"><span class="result-label">${labels[chave] || chave}</span><span class="result-value">${valor}</span></div>`)
        .join("");

    els.addressCard.innerHTML = `<div class="card-header"><h3>Endereço</h3></div><div class="card-body">${linhas || "<p>Sem dados de endereço.</p>"}</div>`;
    els.addressCard.classList.remove("hidden");
}

function renderMapCard(els, coords) {
    if (!coords) {
        els.mapCard.innerHTML = `<div class="card-header"><h3>Mapa</h3></div><div class="card-body"><p class="text-muted">Mapa não disponível para este endereço.</p></div>`;
        els.mapCard.classList.remove("hidden");
        return;
    }

    const embedUrl = GOOGLE_MAPS_API_KEY
        ? getGoogleMapsEmbedUrl(coords.lat, coords.lon, GOOGLE_MAPS_API_KEY)
        : getOpenStreetMapEmbedUrl(coords.lat, coords.lon);

    const mapsLink = getGoogleMapsLink(coords.lat, coords.lon);

    els.mapCard.innerHTML = `<div class="card-header"><h3>Mapa</h3><a href="${mapsLink}" target="_blank" rel="noopener" class="card-link">Abrir no Google Maps →</a></div><div class="card-body map-container"><iframe src="${embedUrl}" width="100%" height="300" style="border:0;" allowfullscreen="" loading="lazy" title="Mapa do endereço"></iframe></div>`;
    els.mapCard.classList.remove("hidden");
}

function renderStreetViewCard(els, coords) {
    if (!coords) {
        els.streetViewCard.classList.add("hidden");
        return;
    }

    const imageUrl = GOOGLE_MAPS_API_KEY
        ? getGoogleStreetViewUrl(coords.lat, coords.lon, GOOGLE_MAPS_API_KEY)
        : null;

    if (!imageUrl) {
        els.streetViewCard.classList.add("hidden");
        return;
    }

    els.streetViewCard.innerHTML = `<div class="card-header"><h3>Street View</h3></div><div class="card-body"><img src="${imageUrl}" alt="Imagem da rua" class="street-view-img" loading="lazy" onerror="this.parentElement.innerHTML='<p class=\\'text-muted\\'>Imagem não disponível para este local.</p>'"></div>`;
    els.streetViewCard.classList.remove("hidden");
}

function renderWeatherCard(els, weather) {
    if (!weather) {
        els.weatherCard.innerHTML = `<div class="card-header"><h3>Clima</h3></div><div class="card-body"><p class="text-muted">Clima não disponível.</p></div>`;
        els.weatherCard.classList.remove("hidden");
        return;
    }

    const descricao = interpretarCodigoClima(weather.codigoClima);
    const icone = getIconeClima(weather.codigoClima);

    els.weatherCard.innerHTML = `<div class="card-header"><h3>Clima</h3></div><div class="card-body weather-content"><div class="weather-main"><span class="weather-icon">${icone}</span><span class="weather-temp">${weather.temperatura}°C</span></div><div class="weather-details"><div class="weather-detail"><span class="weather-label">Sensação térmica</span><span class="weather-value">${weather.temperatura}°C</span></div><div class="weather-detail"><span class="weather-label">Vento</span><span class="weather-value">${weather.velocidadeVento} km/h</span></div><div class="weather-detail"><span class="weather-label">Condição</span><span class="weather-value">${descricao}</span></div></div></div>`;
    els.weatherCard.classList.remove("hidden");
}

function renderIbgeCard(els, ibgeData) {
    if (!ibgeData) {
        els.ibgeCard.innerHTML = `<div class="card-header"><h3>Dados IBGE</h3></div><div class="card-body"><p class="text-muted">Dados do IBGE não disponíveis.</p></div>`;
        els.ibgeCard.classList.remove("hidden");
        return;
    }

    const populacaoFormatada = ibgeData.populacaoEstimada
        ? ibgeData.populacaoEstimada.toLocaleString("pt-BR")
        : "Não disponível";

    els.ibgeCard.innerHTML = `<div class="card-header"><h3>Dados IBGE</h3></div><div class="card-body"><div class="result-row"><span class="result-label">Município</span><span class="result-value">${ibgeData.nome}</span></div><div class="result-row"><span class="result-label">UF</span><span class="result-value">${ibgeData.uf}</span></div><div class="result-row"><span class="result-label">Região</span><span class="result-value">${ibgeData.regiao}</span></div><div class="result-row"><span class="result-label">Código IBGE</span><span class="result-value">${ibgeData.codigoIbge}</span></div><div class="result-row"><span class="result-label">População Estimada</span><span class="result-value">${populacaoFormatada}</span></div></div>`;
    els.ibgeCard.classList.remove("hidden");
}

function renderActionsCard(els, endereco, coords) {
    const favorited = isFavorite(endereco.cep);
    const enderecoCompleto = `${endereco.logradouro}, ${endereco.bairro}, ${endereco.localidade} - ${endereco.uf}, ${endereco.cep}`;
    const mapsLink = coords ? getGoogleMapsLink(coords.lat, coords.lon) : null;

    let actionsHtml = `<div class="actions-grid">`;
    actionsHtml += `<button class="action-btn" id="btnCopy" title="Copiar endereço"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg><span>Copiar</span></button>`;
    actionsHtml += `<button class="action-btn" id="btnShare" title="Compartilhar"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg><span>Compartilhar</span></button>`;
    actionsHtml += `<button class="action-btn" id="btnFavorite" title="Favoritar"><svg width="20" height="20" viewBox="0 0 24 24" fill="${favorited ? "currentColor" : "none"}" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg><span>${favorited ? "Favoritado" : "Favoritar"}</span></button>`;
    if (mapsLink) {
        actionsHtml += `<a href="${mapsLink}" target="_blank" rel="noopener" class="action-btn" title="Abrir no Google Maps"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"></polygon><line x1="9" y1="3" x2="9" y2="18"></line><line x1="15" y1="6" x2="15" y2="21"></line></svg><span>Mapa</span></a>`;
    }
    actionsHtml += `</div>`;

    els.actionsCard.innerHTML = `<div class="card-header"><h3>Ações</h3></div><div class="card-body">${actionsHtml}</div>`;
    els.actionsCard.classList.remove("hidden");

    document.getElementById("btnCopy")?.addEventListener("click", async () => {
        try {
            await navigator.clipboard.writeText(enderecoCompleto);
            showCopyToast();
        } catch {
            showToast("Não foi possível copiar o texto.");
        }
    });

    document.getElementById("btnShare")?.addEventListener("click", async () => {
        const shareData = {
            title: "CEP Explorer",
            text: `Endereço: ${enderecoCompleto}`,
            url: window.location.href
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
                showShareToast();
            } else {
                await navigator.clipboard.writeText(window.location.href);
                showShareToast();
            }
        } catch {
            await navigator.clipboard.writeText(window.location.href);
            showShareToast();
        }
    });

    document.getElementById("btnFavorite")?.addEventListener("click", () => {
        const nowFavorited = toggleFavorite({
            cep: endereco.cep,
            logradouro: endereco.logradouro,
            bairro: endereco.bairro,
            localidade: endereco.localidade,
            uf: endereco.uf
        });
        showFavoriteToast(nowFavorited);
        updateFavoriteButton(els);
        renderFavorites();
    });
}

function renderQRCode(endereco, coords) {
    const container = document.getElementById("qrCodeContainer");
    if (!container) return;

    const text = coords
        ? `https://www.google.com/maps/search/?api=1&query=${coords.lat},${coords.lon}`
        : `${endereco.logradouro}, ${endereco.bairro}, ${endereco.localidade} - ${endereco.uf}, Brasil`;

    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(text)}`;

    container.innerHTML = `<img src="${qrApiUrl}" alt="QR Code do endereço" class="qr-code-img" loading="lazy">`;
}

async function handleGeolocation() {
    const els = getElements();

    if (!navigator.geolocation) {
        showError(els, "Geolocalização não suportada pelo navegador.");
        return;
    }

    showLoading(els);
    hideError(els);
    hideEmpty(els);

    try {
        const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            });
        });

        const { latitude, longitude } = position.coords;

        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
            {
                headers: {
                    "Accept": "application/json",
                    "User-Agent": "CEP-Explorer/1.0 (contato@exemplo.com)"
                }
            }
        );

        if (!response.ok) {
            throw new Error("Erro ao obter endereço da localização.");
        }

        const data = await response.json();
        const cep = data.address.postcode || "";

        if (cep) {
            await handleSearch(cep);
        } else {
            showError(els, "Não foi possível encontrar um CEP para sua localização atual.");
        }

    } catch (err) {
        showError(els, err.message || "Erro ao obter localização. Verifique as permissões.");
    }
}

function showLoading(els) {
    els.loadingSection.classList.remove("hidden");
    els.btnSearch.disabled = true;
    els.resultSection.classList.add("hidden");
    els.errorSection.classList.add("hidden");
    els.emptySection.classList.add("hidden");
}

function hideLoading(els) {
    els.loadingSection.classList.add("hidden");
    els.btnSearch.disabled = false;
}

function showError(els, message) {
    hideLoading(els);
    els.errorSection.querySelector(".error-message").textContent = message;
    els.errorSection.classList.remove("hidden");
    els.resultSection.classList.add("hidden");
    els.emptySection.classList.add("hidden");
}

function hideError(els) {
    els.errorSection.classList.add("hidden");
}

function showEmpty(els) {
    els.emptySection.classList.remove("hidden");
    els.resultSection.classList.add("hidden");
    els.errorSection.classList.add("hidden");
}

function hideEmpty(els) {
    els.emptySection.classList.add("hidden");
}

function clearResults(els) {
    els.resultSection.classList.add("hidden");
    els.errorSection.classList.add("hidden");
    els.emptySection.classList.remove("hidden");
    els.cepHelp.classList.remove("error");
    currentData = null;
    currentCoords = null;
    currentWeather = null;
    currentIbge = null;

    [els.addressCard, els.mapCard, els.streetViewCard, els.weatherCard, els.ibgeCard, els.actionsCard].forEach(
        (card) => {
            if (card) card.classList.add("hidden");
        }
    );

    const qrContainer = document.getElementById("qrCodeContainer");
    if (qrContainer) qrContainer.innerHTML = "";
}

function renderHistory() {
    const history = getHistory();
    const list = document.getElementById("historyList");
    if (!list) return;

    if (history.length === 0) {
        list.innerHTML = "<li class='history-empty'>Nenhuma busca recente.</li>";
        return;
    }

    list.innerHTML = history
        .slice(0, 5)
        .map(
            (item) => `<li class='history-item' data-cep="${item.cep}"><button class='history-search-btn'>${item.cep}</button><span class='history-text'>${item.localidade} - ${item.uf}</span><button class='history-remove-btn' data-cep="${item.cep}" title="Remover">×</button></li>`
        )
        .join("");

    list.querySelectorAll(".history-search-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
            const input = document.getElementById("cepInput");
            if (input) {
                input.value = btn.closest(".history-item").dataset.cep;
                handleSearch(input.value);
            }
        });
    });

    list.querySelectorAll(".history-remove-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
            removeFromHistory(btn.dataset.cep);
            renderHistory();
        });
    });
}

function renderFavorites() {
    const favorites = getFavorites();
    const list = document.getElementById("favoritesList");
    if (!list) return;

    if (favorites.length === 0) {
        list.innerHTML = "<li class='favorites-empty'>Nenhum favorito salvo.</li>";
        return;
    }

    list.innerHTML = favorites
        .map(
            (item) => `<li class='favorite-item' data-cep="${item.cep}"><button class='favorite-search-btn'>${item.cep}</button><span class='favorite-text'>${item.logradouro || item.localidade} - ${item.uf}</span><button class='favorite-remove-btn' data-cep="${item.cep}" title="Remover">×</button></li>`
        )
        .join("");

    list.querySelectorAll(".favorite-search-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
            const input = document.getElementById("cepInput");
            if (input) {
                input.value = btn.closest(".favorite-item").dataset.cep;
                handleSearch(input.value);
            }
        });
    });

    list.querySelectorAll(".favorite-remove-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
            removeFavorite(btn.dataset.cep);
            renderFavorites();
        });
    });
}

function updateThemeIcon() {
    const icon = document.getElementById("themeIcon");
    if (!icon) return;

    const theme = getTheme();
    icon.innerHTML = theme === "dark"
        ? '<circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>'
        : '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>';
}
