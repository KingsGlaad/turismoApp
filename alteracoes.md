# Alterações Arquiteturais — TurismoApp

> **Data:** Abril de 2026
> **Objetivo:** Modernizar a arquitetura de dados, componentes e design system do aplicativo

---

## Resumo Executivo

Foram implementadas **7 melhorias** na base de código, eliminando duplicação de lógica, adicionando cache automático de dados e melhorando a experiência do usuário.

---

## 1. Dependências Adicionadas

```bash
npm install @tanstack/react-query zustand @react-native-async-storage/async-storage
```

| Pacote | Finalidade |
|---|---|
| `@tanstack/react-query` | Cache de dados, gerenciamento de estados loading/error/data |
| `zustand` | Estado global leve (favoritos) |
| `@react-native-async-storage/async-storage` | Persistência offline dos favoritos |

> O `expo-image` já estava instalado (`~3.0.11`) mas não era utilizado — agora é.

---

## 2. Nova Estrutura de Arquivos

### Criados

```
lib/
  api.ts                        → Cliente HTTP centralizado com timeout e ApiError

constants/
  env.ts                        → Validação de variáveis de ambiente no boot
  theme.ts                      → [ATUALIZADO] Design system expandido

hooks/queries/
  useCities.ts                  → Hooks de municípios (TanStack Query)
  useHighlights.ts              → Hooks de destaques turísticos (TanStack Query)
  useEvents.ts                  → Hooks de eventos (TanStack Query)

stores/
  favoritesStore.ts             → Store de favoritos (Zustand + AsyncStorage)

components/ui/
  CachedImage.tsx               → Wrapper do expo-image com cache em disco
  ImageCarousel.tsx             → [ATUALIZADO] Carrossel unificado com CachedImage
```

### Modificados

```
app/_layout.tsx                 → Adicionado QueryClientProvider
app/(tabs)/_layout.tsx          → Permissão de localização removida do boot
app/(tabs)/index.tsx            → Migrado para useCitiesSearch
app/(tabs)/tracks/index.tsx     → Migrado para novos hooks + fluxo de localização
app/(tabs)/events/index.tsx     → Migrado para useEvents
app/cities/[slug].tsx           → Migrado para useCity
app/highlights/[id].tsx         → Migrado para useHighlight
app/events/[id].tsx             → Migrado para useEvent

components/municipio/
  MunicipalityList.tsx          → Refatorado para receber dados via props
                                   (padrão "presentational component") + CachedImage
```

---

## 3. Detalhamento das Mudanças

### 3.1. Cliente HTTP — `lib/api.ts`

**Antes:** `fetch()` espalhado em múltiplos hooks sem padronização.

**Depois:** Função `api.get/post/put/delete` centralizada com:
- **Timeout automático de 10 segundos** via `AbortSignal.timeout`
- **`ApiError`** tipada com HTTP status code para tratamento consistente
- **Headers padrão** (`Accept: application/json`)
- **Suporte a 204 No Content** sem tentar fazer JSON.parse

---

### 3.2. Validação de Ambiente — `constants/env.ts`

**Antes:** `process.env.EXPO_PUBLIC_API_URL` acessado diretamente em `useMunicipalities.ts` sem validação — erro silencioso em produção se variável ausente.

**Depois:** Falha rápida e explícita no boot do app com mensagem de erro clara.

```typescript
// Lança erro com mensagem clara se a variável não existir
export const API_URL = getRequired("EXPO_PUBLIC_API_URL");
```

---

### 3.3. Cache de Dados — TanStack Query

**Antes:** Cada hook gerenciava manualmente `loading`, `error`, `useState`, `useEffect`. Cada navegação para uma tela já visitada disparava uma nova requisição HTTP.

**Depois:** Cache automático com `staleTime` configurado por recurso:

| Recurso | staleTime | Justificativa |
|---|---|---|
| Lista de municípios | 10 minutos | Dado estático — raramente muda |
| Detalhes de município | 10 minutos | Idem |
| GeoJSON IBGE | 60 minutos | Dado completamente estático |
| Destaques aleatórios | 5 minutos | Muda com moderação |
| Detalhes de destaque | 10 minutos | Dado estático |
| Lista de eventos | 5 minutos | Pode mudar com frequência |
| Detalhes de evento | 10 minutos | Dado estático |

**Benefícios práticos:**
- Navegar para Detalhes e voltar → **zero nova requisição**
- App retornar ao foco → **refetch em background** automático
- Sem `refreshing` manual na maioria das telas (TanStack gerencia)

---

### 3.4. Design System — `constants/theme.ts`

**Antes:** 4 cores por tema, sem escala de espaçamento, tipografia ou sombras. Cores hardcoded espalhadas (`"#6b7280"`, `"rgba(128, 128, 128, 0.1)"`, `"#007AFF"`).

**Depois:** Sistema de design completo com tokens exportados:

| Token | Descrição |
|---|---|
| `Brand` | Cores primária e secundária da ADETUR |
| `Colors` | Paleta completa por tema (14 tokens por tema) |
| `Spacing` | Escala de espaçamento (xs → xxl) |
| `Radius` | Raios de borda padronizados |
| `Shadows` | Sombras sm/md/lg |
| `Typography` | Escala tipográfica (h1 → caption) |

---

### 3.5. Cache de Imagens — `CachedImage`

**Antes:** `import { Image } from 'react-native'` — sem cache em disco, sem placeholder, imagens piscam ao navegar.

**Depois:** `expo-image` com:
- **Cache em memória e disco** (`cachePolicy="memory-disk"`)
- **Placeholder via blurhash** enquanto carrega
- **Transição suave de 300ms** ao exibir
- Fallback de cor cinza antes do blurhash renderizar

---

### 3.6. Carrossel Unificado — `ImageCarousel`

**Antes:** Lógica de carrossel duplicada em **3 arquivos** (`tracks/index.tsx`, `MunicipalityDetail.tsx`, `HighlightDetail.tsx`) com ~60 linhas cada.

**Depois:** Componente único com props configuráveis:

```typescript
<ImageCarousel
  images={images}
  height={250}         // Altura configurável
  autoPlay            // Ativa rolagem automática
  autoPlayInterval={4000}
  onImagePress={(index) => openViewer(index)}
/>
```

---

### 3.7. Geolocalização — Fluxo Contextual

**Antes:** Permissão de localização solicitada no **boot do app**, dentro do `_layout.tsx` das tabs — prática penalizada pelas lojas de apps (Apple e Google).

**Depois:** Permissão solicitada **contextualmente** na tela "Explorar", quando o usuário toca no botão "📍 Ativar Localização", com contexto visual claro do motivo.

- A tela exibe um placeholder explicativo antes da permissão
- Enquanto a localização não está ativa, a seção "Perto de você" fica oculta
- Após ativar, o mapa satelital é exibido e os municípios próximos são calculados

---

### 3.8. Favoritos — `favoritesStore`

**Novo:** Store Zustand com persistência offline via AsyncStorage.

```typescript
const { isFavorite, toggle } = useFavoritesStore();

// Favoritando um município
toggle('municipality', city.id);

// Verificando se está favoritado
isFavorite('municipality', city.id); // true | false
```

Suporta os tipos: `municipality`, `highlight`, `event`.
Persiste entre sessões do app, funciona offline.

---

### 3.9. MunicipalityList — Padrão Presentational

**Antes:** Componente buscava dados internamente com `useMunicipalities()` — dificultava reutilização e testabilidade.

**Depois:** Recebe dados via props (`municipalities`, `loading`, `error`). O componente pai (tela) é responsável pela busca. Esse é o padrão "container/presentational" que facilita testes e reuso.

---

## 4. Arquitetura Resultante

```
Telas (app/)
  └── usam hooks de queries (hooks/queries/)
         └── usam cliente HTTP (lib/api.ts)
                └── usa constante de URL validada (constants/env.ts)

Componentes (components/)
  └── recebem dados via props
      └── usam CachedImage (expo-image com cache)

Estado Global (stores/)
  └── Zustand + AsyncStorage (offline-first)

QueryClientProvider (app/_layout.tsx)
  └── Cobre toda a árvore de componentes
```

---

## 5. Compatibilidade

Todas as alterações são **retrocompatíveis**. O arquivo `hooks/useMunicipalities.ts` original **não foi removido** — ele ainda pode ser usado como fallback ou removido gradualmente. Os novos hooks em `hooks/queries/` são o caminho preferencial para novas telas e refatorações futuras.
