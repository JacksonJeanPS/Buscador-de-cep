function criarElementoResultadoSucesso(value) {
    const result = document.querySelector("#result");
    result.innerHTML = "";
    if (!!value.cep) {
        for (const property in value) {
            result.insertAdjacentHTML (
                "beforeend",
                `<li><strong>${property}:</strong> ${value[property]}</li>`
            );
        }
    }else {
        criarElementoResultadoErro("Cep não encontrado!!!");
    }
}

function criarElementoResultadoErro(value) {
    const result = document.querySelector("#result");
    result.innerHTML = "";
    result.insertAdjacentHTML(
        "beforeend",
        `<h2 class="error">${value}</h2>`
    );
}

function pesquisarCEP(cep) {
    const result = document.querySelector("#result");
    const btn = document.querySelector("button[type='submit']");
    result.innerHTML = '<li class="loading">Buscando...</li>';
    btn.disabled = true;
    const url = `https://viacep.com.br/ws/${cep}/json/`;
    fetch(url)
        .then((response) => response.json())
        .then((result) => {
            btn.disabled = false;
            criarElementoResultadoSucesso(result);
        })
        .catch((err) => {
            btn.disabled = false;
            criarElementoResultadoErro("CEP inválido ou erro na busca!!!");
        });
}

const form = document.querySelector("form")
const inputCEP = document.querySelector("#cep");

inputCEP.addEventListener("input", function (e) {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 8) value = value.slice(0, 8);
    e.target.value = value.replace(/(\d{5})(\d)/, "$1-$$2");
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