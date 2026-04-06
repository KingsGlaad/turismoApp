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