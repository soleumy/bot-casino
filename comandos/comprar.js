// comandos/comprar.js
import { tienda } from './tiendadata.js';

export default async (sock, m, args, { user, guardarEconomia, jid }) => {
    // La entrada del usuario DEBE ser la clave del ítem (ej. "alcohol", "arma-fuego").
    // Unimos los argumentos con un guion bajo y los convertimos a minúsculas para coincidir con las claves.
    const itemKeyInput = args.join("-").toLowerCase();

    // Busca el ítem en la tienda por su clave (código)
    const itemToBuy = tienda.find(item => item.clave === itemKeyInput);

    if (!itemToBuy) {
        return sock.sendMessage(jid, {
            text: '❌ *Error de compra:*\n"El código de ese artículo no está disponible en nuestro catálogo. Asegúrate de escribirlo correctamente."\n\n_Puedes ver los artículos disponibles con: *$tienda*_'
        }, { quoted: m });
    }

    // Verificar si el usuario tiene suficiente dinero
    if (user.dinero < itemToBuy.precio) {
        return sock.sendMessage(jid, {
            text: `💸 *Fondos insuficientes:*\n"Necesitas 💰 ${itemToBuy.precio} para adquirir *${itemToBuy.nombre}*. Tu saldo actual es de 💰 ${user.dinero}."\n\n_Intenta ganar más dinero con: *$trabajar* o *$apostar*_'`
        }, { quoted: m });
    }

    // Verificar si el usuario ya posee una propiedad única de este tipo (ej. "doble-personaje", "arma-fuego").
    // Asumimos que si un ítem otorga una "propiedad" o "arma", no se pueden tener múltiples.
    // Esta lista debe ser coherente con la lógica de '$usar' para ítems que no desaparecen del inventario.
    const itemsUnicosOPropiedades = [
        'favor-adm', 'camaras', 'arma-blanca', 'doble-personaje', 'arma-fuego',
        'veneno-letal', 'inmunidad-muerte', 'salvacion', 'ausencia'
        // Puedes añadir más claves aquí si hay otros ítems que se consideran "únicos"
        // y no deberían poder comprarse varias veces si ya se poseen.
    ];

    if (itemsUnicosOPropiedades.includes(itemToBuy.clave)) {
        // Para ítems con un contador de usos (como 'camaras', 'inmunidad-muerte', 'salvacion'),
        // se debería verificar si el usuario ya tiene la funcionalidad activa o usos restantes.
        // Por ahora, solo verificamos si ya tienen el ítem en el inventario.
        if (user.inventario.includes(itemToBuy.clave)) {
            return sock.sendMessage(jid, {
                text: `⛔ *Artículo ya poseído:*\n"Ya tienes *${itemToBuy.nombre}* (${itemToBuy.clave}) en tu inventario. No puedes adquirir otro de este tipo."`
            }, { quoted: m });
        }
    }


    // Realizar la compra
    user.dinero -= itemToBuy.precio;
    user.inventario.push(itemToBuy.clave); // ¡IMPORTANTE! Añade la CLAVE del ítem al inventario.

    // Marcar cambios para guardar la economía
    guardarEconomia();

    return sock.sendMessage(jid, {
        text: `✓  ¡Compra exitosa!\nHas adquirido *${itemToBuy.nombre}* por 💰 ${itemToBuy.precio} monedas. ¡Ahora es tuyo!\n\n_Puedes ver tus posesiones con: *$inventario*_'`
    }, { quoted: m });
};