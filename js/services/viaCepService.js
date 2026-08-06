const VIA_CEP_BASE = "https://viacep.com.br/ws";

export async function buscarEnderecoPorCep(cep) {
    const cepLimpo = cep.replace(/\D/g, "");
    if (!/^\d{8}$/.test(cepLimpo)) {
        throw new Error("CEP inválido. Digite 8 números.");
    }

    const response = await fetch(`${VIA_CEP_BASE}/${cepLimpo}/json/`);
    if (!response.ok) {
        throw new Error("Erro na consulta do CEP. Tente novamente.");
    }

    const data = await response.json();
    if (data.erro) {
        throw new Error("CEP não encontrado.");
    }

    return {
        cep: data.cep || "",
        logradouro: data.logradouro || "",
        complemento: data.complemento || "",
        bairro: data.bairro || "",
        localidade: data.localidade || "",
        uf: data.uf || "",
        ibge: data.ibge || "",
        gia: data.gia || "",
        ddd: data.ddd || "",
        siafi: data.siafi || ""
    };
}
