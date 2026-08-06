# CEP Explorer

Aplicação web estática e moderna para explorar endereços brasileiros a partir de um CEP. Consulta dados no ViaCEP, exibe mapa interativo, Street View, clima atual, dados demográficos do IBGE e muito mais — tudo em uma experiência visual rica com tema claro/escuro.

## Funcionalidades

- Busca de CEP com máscara automática e validação
- Exibição completa do endereço com dados do ViaCEP
- Mapa interativo (Google Maps Embed API ou OpenStreetMap)
- Imagem de Street View do local (Google Street View Static API)
- Clima atual via Open-Meteo (temperatura, vento, condição)
- Dados do IBGE: município, UF, região, código IBGE e população estimada
- Histórico de buscas salvo em `localStorage` (últimas 20 consultas)
- Favoritos para acesso rápido
- Botão copiar endereço com toast de confirmação
- Compartilhar via Web Share API (com fallback para cópia de link)
- QR Code do endereço/localização
- Geolocalização do usuário para buscar o CEP mais próximo
- Tema claro/escuro com toggle persistente
- Totalmente responsivo com layout em grid adaptativo
- Acessibilidade: `aria-live`, `aria-label`, `role="alert"`, foco gerenciado
- PWA instalável com service worker e cache offline

## Tecnologias

- HTML5
- CSS3 (custom properties, glassmorphism, grid, animações)
- JavaScript ES6+ (módulos nativos, sem frameworks)
- Service Worker para cache offline

## APIs Integradas

| API | Uso | Chave Necessária |
|---|---|---|
| **ViaCEP** | Endereço a partir do CEP | Não |
| **Nominatim / OpenStreetMap** | Geocodificação e mapa alternativo | Não |
| **Google Maps Embed API** | Mapa interativo | Sim (opcional) |
| **Google Street View Static API** | Imagem da rua | Sim (opcional) |
| **Open-Meteo** | Clima atual | Não |
| **IBGE** | Dados municipais e população | Não |

> **Nota:** O Google Maps e Street View são opcionais. Sem chave de API, o app funciona integralmente usando Nominatim (mapa) e oculta o Street View.

## Como Executar Localmente

1. Clone o repositório:
   ```bash
   git clone https://github.com/JacksonJeanPS/Buscador-de-cep.git
   cd CEP-Explorer
   ```

2. Sirva os arquivos estáticos. Devido ao uso de módulos ES e service worker, **não** basta abrir o `index.html` diretamente — use um servidor local:

   ```bash
   # Python 3
   python -m http.server 8080

   # Node.js (npx)
   npx serve .

   # PHP
   php -S localhost:8080
   ```

3. Acesse `http://localhost:8080/CEP-Explorer` no navegador.

## Configurando Google Maps (Opcional)

Para habilitar o mapa do Google Maps e o Street View, você precisa de uma chave da Google Cloud com as APIs habilitadas:

1. Acesse o [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um projeto e habilite as APIs:
   - **Maps Embed API**
   - **Street View Static API**
3. Crie uma credencial do tipo **API Key**
4. Restrinja a chave por domínio/referrer (ex: `seudominio.com/*` ou `localhost/*` para desenvolvimento)
5. Edite o arquivo `js/services/mapsService.js` e insira a chave:

   ```javascript
   const GOOGLE_MAPS_API_KEY = "SUA_CHAVE_AQUI";
   ```

### Boas Práticas de Segurança

- **Nunca** compartilhe a chave publicamente em repositórios ou fóruns.
- Restrinja sempre por domínio/referrer no console do Google Cloud.
- Não use chaves com escopo amplo (ex: sem restrições).
- Para produção, considere usar um proxy simples para ocultar a chave.

## Estrutura do Projeto

```
CEP-Explorer/
├── index.html
├── manifest.json
├── sw.js
├── css/
│   └── style.css
├── js/
│   ├── main.js
│   ├── services/
│   │   ├── viaCepService.js
│   │   ├── nominatimService.js
│   │   ├── ibgeService.js
│   │   ├── weatherService.js
│   │   └── mapsService.js
│   └── ui/
│       ├── theme.js
│       ├── toast.js
│       ├── history.js
│       ├── favorites.js
│       └── app.js
└── assets/
    └── icons/
        ├── icon-192.svg
        └── icon-512.svg
```

## Deploy

O projeto é 100% estático. Basta fazer upload da pasta `CEP-Explorer` para qualquer hospedagem de arquivos estáticos (GitHub Pages, Netlify, Vercel, Cloudflare Pages, etc.).

### GitHub Pages

1. Vá em **Settings → Pages** do repositório
2. Em **Source**, selecione a branch e a pasta `/CEP-Explorer`
3. Acesse `https://seuusuario.github.io/Buscador-de-cep/CEP-Explorer/`

## Licença

MIT
