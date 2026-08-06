const OPEN_METEO_BASE = "https://api.open-meteo.com/api/v1";

export async function buscarClima(lat, lon) {
    const url = `${OPEN_METEO_BASE}/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&timezone=auto`;

    const response = await fetch(url);
    if (!response.ok) {
        throw new Error("Erro ao consultar o clima.");
    }

    const data = await response.json();
    const current = data.current_weather;

    return {
        temperatura: current.temperature,
        velocidadeVento: current.windspeed,
        direcaoVento: current.winddirection,
        codigoClima: current.weathercode,
        hora: current.time
    };
}

export function interpretarCodigoClima(codigo) {
    const mapa = {
        0: "Céu limpo",
        1: "Predominantemente limpo",
        2: "Parcialmente nublado",
        3: "Nublado",
        45: "Nevoeiro",
        48: "Nevoeiro com gelo",
        51: "Garoa leve",
        53: "Garoa moderada",
        55: "Garoa intensa",
        61: "Chuva fraca",
        63: "Chuva moderada",
        65: "Chuva forte",
        71: "Neve fraca",
        73: "Neve moderada",
        75: "Neve forte",
        80: "Pancadas de chuva fracas",
        81: "Pancadas de chuva moderadas",
        82: "Pancadas de chuva violentas",
        95: "Tempestade",
        96: "Tempestade com granizo leve",
        99: "Tempestade com granizo forte"
    };

    return mapa[codigo] || "Condição desconhecida";
}

export function getIconeClima(codigo) {
    const iconeMapa = {
        0: "☀️",
        1: "🌤️",
        2: "⛅",
        3: "☁️",
        45: "🌫️",
        48: "🌫️",
        51: "🌦️",
        53: "🌦️",
        55: "🌧️",
        61: "🌧️",
        63: "🌧️",
        65: "⛈️",
        71: "❄️",
        73: "❄️",
        75: "❄️",
        80: "🌦️",
        81: "🌧️",
        82: "⛈️",
        95: "⛈️",
        96: "⛈️",
        99: "⛈️"
    };

    return iconeMapa[codigo] || "🌡️";
}
