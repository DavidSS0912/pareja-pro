export const FormatCurrency = (amount) => {
  return new Intl.NumberFormat('es-MX', { 
    style: 'currency', 
    currency: 'MXN', 
    maximumFractionDigits: 0 
  }).format(amount);
};
