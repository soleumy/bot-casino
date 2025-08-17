// comandos/dar.js

export default async (sock, m, args, { user, guardarEconomia, jid, remitente, obtenerDatosDelChat, isGroup }) => {
    // Expected usage: $dar @mencion <nombre-del-item>

    const mentionedJids = m.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];

    if (mentionedJids.length === 0) {
        return sock.sendMessage(jid, {
            text: '✕ Debes mencionar al usuario a quien deseas dar un ítem y luego el nombre del ítem. Ejemplo: *$dar @usuario mi_item*',
        }, { quoted: m });
    }

    const targetJid = mentionedJids[0]; // El primer mencionado es el destinatario
    const targetUser = obtenerDatosDelChat(jid, targetJid, isGroup);

    if (!targetUser) {
        return sock.sendMessage(jid, {
            text: `✕ El usuario *@${targetJid.split('@')[0]}* no pudo ser encontrado en la base de datos. Asegúrate de que haya interactuado con el bot antes.`,
        }, { mentions: [targetJid], quoted: m });
    }

    // Asegúrate de que el usuario no se dé items a sí mismo
    if (targetJid === remitente) {
        return sock.sendMessage(jid, {
            text: '🤔 No puedes darte ítems a ti mismo.',
        }, { quoted: m });
    }

    // Normaliza la entrada del usuario y las claves de los ítems
    const normalizado = (str) => str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, '');

    // Los argumentos restantes después de la mención son el nombre del ítem
    // Filtrar los JIDs mencionados para obtener solo las palabras del ítem
    const itemArgs = args.filter(arg => !arg.startsWith('@'));
    const itemKey = normalizado(itemArgs.join(" "));

    if (!itemKey) {
        return sock.sendMessage(jid, {
            text: '✕ Debes especificar el nombre del ítem que deseas dar después de mencionar al usuario.',
        }, { quoted: m });
    }

    // Buscar el ítem en el inventario del remitente
    // 'user' es el remitente aquí, y su inventario ya está garantizado por index.mjs
    const remitenteInventario = user.inventario;
    const itemIndex = remitenteInventario.findIndex(i => normalizado(i) === itemKey);

    if (itemIndex === -1) {
        return sock.sendMessage(jid, {
            text: `✓  El ítem *${itemArgs.join(' ')}* no se encuentra en tu inventario. Revisa tus ítems con *$inventario*.`,
        }, { quoted: m });
    }

    // Obtener el nombre original del ítem antes de removerlo
    const itemName = remitenteInventario[itemIndex];

    // Remover el ítem del inventario del remitente
    remitenteInventario.splice(itemIndex, 1);

    // Añadir el ítem al inventario del destinatario
    targetUser.inventario.push(itemName); // Se añade el nombre original del ítem

    // Marcar cambios para guardar la economía (afecta a ambos usuarios)
    guardarEconomia();

    return sock.sendMessage(jid, {
        text: `✓  Has dado *${itemName}* a *@${targetJid.split('@')[0]}*.`,
        mentions: [remitente, targetJid],
    }, { quoted: m });
};

export const config = {
    name: 'dar',
    alias: ['give'],
    description: 'Permite a los usuarios dar ítems de su inventario a otros usuarios.',
    usage: '$dar @mencion <nombre-del-item>',
    cooldown: 5,
    necesitaMetadata: false, // No necesita metadata de grupo especial, solo el jid del mencionado.
};