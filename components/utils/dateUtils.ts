export const formatDate = (dateString?: string) => {
  if (!dateString) return "Data não informada";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "Data inválida";

  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

export const formatShortDate = (dateString?: string) => {
  if (!dateString) return "n/a";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "n/a";

  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "2-digit",
  });
};
