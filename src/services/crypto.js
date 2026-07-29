/**
 * Servicio de Seguridad y Criptografía
 * Utiliza Web Crypto API (SHA-256) nativa del navegador para garantizar
 * que ninguna contraseña se almacene o visualice en texto plano.
 */

// Sal fija para aumentar la seguridad del hash en el cliente
const SALT = "Logistica2027_YogurGriegoJunin_SecureSalt_v1";

/**
 * Genera un hash SHA-256 a partir de una contraseña en texto plano.
 * @param {string} password - Contraseña ingresada
 * @returns {Promise<string>} Hash hexadecimal de 64 caracteres
 */
export async function hashPassword(password) {
  if (!password) return "";
  const encoder = new TextEncoder();
  const data = encoder.encode(password + SALT);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Verifica si una contraseña coincide con el hash almacenado.
 * @param {string} inputPassword - Contraseña ingresada por el usuario
 * @param {string} storedHash - Hash guardado en almacenamiento
 * @returns {Promise<boolean>} Verdadero si coincide
 */
export async function verifyPassword(inputPassword, storedHash) {
  if (!inputPassword || !storedHash) return false;
  const inputHash = await hashPassword(inputPassword);
  return inputHash === storedHash;
}
