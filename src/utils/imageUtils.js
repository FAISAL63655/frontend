/**
 * Utilidades para manejar imágenes de usuarios
 */

/**
 * Obtiene las iniciales de un nombre (hasta 2 caracteres)
 * @param {string} name - Nombre completo
 * @returns {string} - Iniciales (1-2 caracteres)
 */
export const getInitials = (name) => {
  if (!name) return '';
  
  // Dividir el nombre por espacios y obtener la primera letra de cada parte
  const parts = name.split(' ');
  
  if (parts.length === 1) {
    // Si solo hay una palabra, devolver la primera letra
    return parts[0].charAt(0).toUpperCase();
  } else {
    // Si hay múltiples palabras, devolver la primera letra de la primera y última palabra
    const firstInitial = parts[0].charAt(0);
    const lastInitial = parts[parts.length - 1].charAt(0);
    return (firstInitial + lastInitial).toUpperCase();
  }
};

/**
 * Obtiene un color basado en el nombre (para avatares)
 * @param {string} name - Nombre completo
 * @returns {string} - Color en formato hexadecimal
 */
export const getAvatarColor = (name) => {
  if (!name) return '#1976D2'; // Color por defecto (azul primario)
  
  // Colores predefinidos para avatares
  const colors = [
    '#1976D2', // Azul
    '#388E3C', // Verde
    '#E53935', // Rojo
    '#F57C00', // Naranja
    '#8E24AA', // Púrpura
    '#0097A7', // Cian
    '#FBC02D', // Amarillo
    '#5D4037', // Marrón
    '#455A64', // Azul grisáceo
    '#616161'  // Gris
  ];
  
  // Calcular un índice basado en la suma de los códigos de caracteres del nombre
  let sum = 0;
  for (let i = 0; i < name.length; i++) {
    sum += name.charCodeAt(i);
  }
  
  // Usar el módulo para obtener un índice dentro del rango de colores
  const colorIndex = sum % colors.length;
  
  return colors[colorIndex];
};
