const NOMINATIM_BASE = "https://nominatim.openstreetmap.org";

export async function geocodificarEndereco(endereco) {
    const queries = [
        `${endereco.logradouro}, ${endereco.bairro}, ${endereco.localidade} - ${endereco.uf}, Brasil`,
        `${endereco.localidade} - ${endereco.uf}, Brasil`
    ];

    let data = [];
    for (const query of queries) {
        const url = `${NOMINATIM_BASE}/search?q=${encodeURIComponent(query)}&format=json&limit=1`;

        const response = await fetch(url, {
            headers: {
                "Accept": "application/json",
                "User-Agent": "CEP-Explorer/1.0 (contato@exemplo.com)"
            }
        });

        if (!response.ok) {
            throw new Error("Erro na geocodificação do endereço.");
        }

        data = await response.json();
        if (data && data.length > 0) {
            break;
        }
    }

    if (!data || data.length === 0) {
        throw new Error("Não foi possível localizar o endereço no mapa.");
    }

    return {
        lat: parseFloat(data[0].lat),
        lon: parseFloat(data[0].lon),
        displayName: data[0].display_name
    };
}
