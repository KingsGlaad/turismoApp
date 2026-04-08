/**
 * Validação de variáveis de ambiente no boot da aplicação.
 * Garante falha rápida e explícita caso alguma variável obrigatória esteja ausente.
 */

export const API_URL = process.env.EXPO_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error(
    `[ENV] Variável de ambiente obrigatória "EXPO_PUBLIC_API_URL" não está definida.\n` +
      `Verifique seu arquivo .env e reinicie o servidor de desenvolvimento.`,
  );
}
