/**
 * Servicio de Integración con WhatsApp
 * Genera enlaces directos `https://wa.me/` para notificar a clientes
 * sobre el estado de su reparto y link de seguimiento en vivo.
 */

/**
 * Formatea un número telefónico para la API de WhatsApp (wa.me)
 * Agrega código de país Argentina (549) por defecto si no lo tiene.
 * @param {string} phone 
 * @returns {string}
 */
export function formatPhoneForWhatsApp(phone) {
  if (!phone) return '';
  // Remover caracteres no numéricos
  let cleaned = phone.replace(/\D/g, '');

  // Si empieza con 0 (ej: 02364...), quitar el 0 inicial
  if (cleaned.startsWith('0')) {
    cleaned = cleaned.substring(1);
  }

  // Si no incluye el código de país 549 (Argentina), agregarlo
  if (!cleaned.startsWith('549') && !cleaned.startsWith('54')) {
    cleaned = '549' + cleaned;
  } else if (cleaned.startsWith('54') && !cleaned.startsWith('549')) {
    cleaned = '549' + cleaned.substring(2);
  }

  return cleaned;
}

/**
 * Genera el enlace de WhatsApp con el mensaje pre-armado
 * @param {object} order - Datos del pedido
 * @param {object} driver - Repartidor asignado
 * @param {object} config - Configuración del comercio
 * @returns {string} URL lista para abrir wa.me
 */
export function generateOrderWhatsAppLink(order, driver, config) {
  const storeName = config?.storeName || 'Yogur Griego Junín';
  const phone = formatPhoneForWhatsApp(order.customerPhone);
  const trackingUrl = window.location.origin + window.location.pathname;

  const driverName = driver ? driver.name : 'nuestro repartidor';
  const driverVehicle = driver ? `(${driver.vehicle})` : '';

  const message = `¡Hola *${order.customerName}*! 👋

Te avisamos de *${storeName}* que tu pedido *#${order.id}* ya está *EN CAMINO* 🛵💨

👤 *Repartidor:* ${driverName} ${driverVehicle}
📍 *Dirección de entrega:* ${order.address}
💰 *Total a abonar:* ${config?.currencySymbol || '$'}${order.total}

Puedes seguir el estado de tu entrega en tiempo real ingresando aquí:
👉 ${trackingUrl}

¡Gracias por tu compra! 🙌`;

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
