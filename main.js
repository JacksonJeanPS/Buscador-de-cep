function criarElementoResultadoSucesso(value) {
    const result = document.querySelector("#result");
    result.innerHTML = "";
    if (!!value.cep) {
        const labels = {
            cep: "CEP",
            logradouro: "Logradouro",
            complemento: "Complemento",
            bairro: "Bairro",
            localidade: "Cidade",
            uf: "Estado",
            ibge: "IBGE",
            gia: "GIA",
            ddd: "DDD",
            siafi: "SIAFI"
        };
        let html = "<dl>";
        for (const property in value) {
            const label = labels[property] || property;
            html += `<dt>${label}</dt><dd>${value[property]}</dd>`;
        }
        html += "</dl>";
        result.insertAdjacentHTML("beforeend", html);
    }else {
        criarElementoResultadoErro("CEP não encontrado!!!");
    }
}

function criarElementoResultadoErro(value) {
    const result = document.querySelector("#result");
    result.innerHTML = "";
    result.insertAdjacentHTML(
        "beforeend",
        `<div class="error" role="alert">${value}</div>`
    );
}

function pesquisarCEP(cep) {
    const result = document.querySelector("#result");
    const btn = document.querySelector("button[type='submit']");
    result.innerHTML = '<div class="loading"><span class="spinner" aria-hidden="true"></span><span class="sr-only">Buscando...</span></div>';
    btn.disabled = true;
    const url = `https://viacep.com.br/ws/${cep}/json/`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    fetch(url, { signal: controller.signal })
        .then((response) => response.json())
        .then((data) => {
            clearTimeout(timeoutId);
            btn.disabled = false;
            if (data.erro) {
                criarElementoResultadoErro("CEP não encontrado!!!");
            } else {
                criarElementoResultadoSucesso(data);
            }
        })
        .catch((err) => {
            clearTimeout(timeoutId);
            btn.disabled = false;
            if (err.name === 'AbortError') {
                criarElementoResultadoErro("Tempo de requisição esgotado. Tente novamente.");
            } else {
                criarElementoResultadoErro("Erro na conexão. Verifique sua internet.");
            }
        });
}

const form = document.querySelector("form")
const inputCEP = document.querySelector("#cep");

inputCEP.addEventListener("input", function (e) {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 8) value = value.slice(0, 8);
    if (value.length > 5) {
        e.target.value = value.slice(0, 5) + "-" + value.slice(5);
    } else {
        e.target.value = value;
    }
});

form.addEventListener("submit", function (e) {
    e.preventDefault();
    const cep = inputCEP.value.replace(/\D/g, "");
    if (/^[0-9]{8}$/.test(cep)) {
        pesquisarCEP(cep);
    }else {
        criarElementoResultadoErro("CEP inválido!!!");
    }
});

document.querySelector("#clearBtn")?.addEventListener("click", function () {
    inputCEP.value = "";
    document.querySelector("#result").innerHTML = "";
    inputCEP.focus();
});