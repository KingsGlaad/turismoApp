/**
 * Validação de variáveis de ambiente no boot da aplicação.
 * Garante falha rápida e explícita caso alguma variável obrigatória esteja ausente.
 */

const getRequired = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(
      `[ENV] Variável de ambiente obrigatória "${key}" não está definida.\n` +
      `Verifique seu arquivo .env e reinicie o servidor de desenvolvimento.`
    );
  }
  return value;
};

export const API_URL = getRequired("EXPO_PUBLIC_API_URL");
