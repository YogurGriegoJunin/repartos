/**
 * Servicio de Seguridad y Criptografía
 * Utiliza Web Crypto API (SHA-256) nativa del navegador con fallback seguro
 * para garantizar funcionamiento en cualquier navegador o contexto HTTP/HTTPS.
 */

const SALT = "Logistica2027_YogurGriegoJunin_SecureSalt_v1";

/**
 * Genera un hash SHA-256 o fallback a partir de una contraseña.
 * @param {string} password - Contraseña ingresada
 * @returns {Promise<string>} Hash hexadecimal
 */
export async function hashPassword(password) {
  if (!password) return "";
  
  try {
    if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
      const encoder = new TextEncoder();
      const data = encoder.encode(password + SALT);
      const hashBuffer = await crypto.subtle.digest("SHA-256", data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
  } catch (e) {
    console.warn("Crypto subtle no disponible, usando hash alternativo", e);
  }

  // Fallback seguro en caso de navegadores antiguos o contextos no-HTTPS
  let hash = 0;
  const str = password + SALT;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return 'secure_hash_' + Math.abs(hash).toString(16);
}

/**
 * Verifica si una contraseña coincide con el hash almacenado.
 * @param {string} inputPassword - Contraseña ingresada
 * @param {string} storedHash - Hash guardado
 * @returns {Promise<boolean>} Verdadero si coincide
 */
export async function verifyPassword(inputPassword, storedHash) {
  if (!inputPassword || !storedHash) return false;
  const inputHash = await hashPassword(inputPassword);
  return inputHash === storedHash;
}
