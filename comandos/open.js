// comandos/open.js

export default async function openHandler(sock, m, args, extra) {
    const { jid, isGroup, remitente, groupAdmins } = extra;

    // Validación: solo se puede usar en grupos
    if (!isGroup) {
        return sock.sendMessage(
            jid,
            { text: '❌ Este comando solo puede ser usado en grupos.' },
            { quoted: m }
        );
    }

    // Estandarizar el JID del remitente para la comparación
    // Removemos cualquier sufijo de dispositivo y aseguramos que sea @s.whatsapp.net
    const cleanRemitenteJid = remitente.split('@')[0] + '@s.whatsapp.net';

    // Validar que el usuario sea admin
    // Aseguramos que los JIDs en groupAdmins también estén limpios para una comparación precisa
    const cleanGroupAdmins = groupAdmins.map(adminJid => adminJid.split('@')[0] + '@s.whatsapp.net');
    const esAdmin = cleanGroupAdmins.includes(cleanRemitenteJid);

    if (!esAdmin) {
        return sock.sendMessage(
            jid,
            { text: '⛔ Solo los administradores del grupo pueden abrir el chat.' },
            { quoted: m }
        );
    }

    try {
        await sock.groupSettingUpdate(jid, 'not_announcement');
        return sock.sendMessage(
            jid,
            { text: '🔓 El chat ha sido *abierto*. Todos los miembros pueden enviar mensajes.' },
            { quoted: m }
        );
    } catch (error) {
        console.error("Error al abrir el chat:", error);
        return sock.sendMessage(
            jid,
            { text: '❌ Ocurrió un error al intentar abrir el chat. Por favor, inténtalo de nuevo.' },
            { quoted: m }
        );
    }
}

export const config = {
    name: 'open',
    alias: ['abrir', 'unlock'],
    description: 'Permite a los administradores del grupo abrir el chat, permitiendo a todos los miembros enviar mensajes.',
    usage: '$open',
    necesitaMetadata: true, // Se necesita para verificar si el usuario es admin.
};