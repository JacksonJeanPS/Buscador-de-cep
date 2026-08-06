const IBGE_BASE = "https://servicodados.ibge.gov.br/api/v1/localidades";

export async function buscarDadosMunicipio(uf, municipio) {
    const url = `${IBGE_BASE}/municipios?view=nivelado&orderBy=nome`;
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error("Erro ao consultar dados do IBGE.");
    }

    const data = await response.json();
    const municipioEncontrado = data.find(
        (item) =>
            item.UF.sigla.toLowerCase() === uf.toLowerCase() &&
            item.nome.toLowerCase() === municipio.toLowerCase()
    );

    if (!municipioEncontrado) {
        return null;
    }

    return {
        codigoIbge: municipioEncontrado.id,
        nome: municipioEncontrado.nome,
        uf: municipioEncontrado.UF.sigla,
        regiao: municipioEncontrado.UF.regiao.nome,
        populacaoEstimada: null
    };
}

export async function buscarPopulacaoEstimada(codigoIbge) {
    const url = `https://servicodados.ibge.gov.br/api/v1/projecoes/populacao/${codigoIbge}`;
    const response = await fetch(url);

    if (!response.ok) {
        return null;
    }

    const data = await response.json();
    return data.projecao?.populacao || null;
}
