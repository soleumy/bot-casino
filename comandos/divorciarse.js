// comandos/divorciarse.js

export default async function divorciarseHandler(sock, m, args, extra) {
    // Destructurar las variables necesarias del objeto 'extra'
    // 'db' es tu base de datos global (economiaGlobal)
    // 'remitente' es el JID del remitente
    // 'jid' es el JID del chat
    // 'isGroup' indica si el chat es un grupo
    // 'guardarEconomia' es la función para guardar cambios en 'db'
    const { db, remitente, jid, isGroup, guardarEconomia } = extra;

    // Los matrimonios se almacenan en db._parejas dentro de la estructura de tu DB global.
    db._parejas = db._parejas || {}; // Asegurarse de que _parejas exista

    // Comando solo funciona en grupos
    if (!isGroup) {
        return sock.sendMessage(jid, { text: 'Este comando solo puede ser usado en grupos.' }, { quoted: m });
    }

    const menciones = m.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];

    if (menciones.length === 0) { // Si no hay menciones
        return sock.sendMessage(
            jid,
            {
                text: 'Debes mencionar al usuario de quien deseas divorciarte. Ejemplo: $divorciarse @usuario',
            },
            { quoted: m }
        );
    }

    const parejaJid = menciones[0]; // La JID de la persona mencionada

    // Prevenir auto-divorcio o divorcio con el bot
    const botId = sock.user?.id?.split(':')[0] + '@s.whatsapp.net';
    if (parejaJid === remitente || parejaJid === botId) {
        return sock.sendMessage(jid, { text: 'No puedes divorciarte de ti mismo ni del bot.' }, { quoted: m });
    }

    // Buscar la pareja en la base de datos global de matrimonios (db._parejas)
    // Usamos la clave canónica (JIDs ordenados alfabéticamente) para buscar.
    const idsOrdenados = [remitente, parejaJid].sort();
    const clavePareja = `${idsOrdenados[0]}|${idsOrdenados[1]}`;

    // Verificar si esta pareja existe en db._parejas
    if (!db._parejas[clavePareja]) {
        return sock.sendMessage(
            jid,
            {
                text: 'Esta unión no se encuentra registrada. O no están unidos, o no lo están con ese usuario.',
            },
            { quoted: m }
        );
    }

    // Disolver el lazo sagrado
    delete db._parejas[clavePareja]; // Eliminar la entrada de la pareja

    // Marcar cambios para guardar en la base de datos global
    guardarEconomia();

    const divorciadoNombre = `@${remitente.split('@')[0]}`;
    const exParejaNombre = `@${parejaJid.split('@')[0]}`;

    const mensaje = `
Se ha registrado la disolución de la unión.

${divorciadoNombre} y ${exParejaNombre} han finalizado su unión.
`;

    // URL de la imagen de divorcio que proporcionaste
    const imageUrl = 'https://i.pinimg.com/1200x/7a/af/7c/7aaf7c631269ac5fb7b0b0ad5e19084b.jpg';

    await sock.sendMessage(
        jid,
        {
            image: { url: imageUrl },
            caption: mensaje,
            mentions: [remitente, parejaJid] // Menciona al que se divorcia y a la ex-pareja
        },
        { quoted: m }
    );
};

export const config = {
    name: 'divorciarse',
    alias: ['divorce', 'separar'],
    description: 'Permite disolver una unión registrada entre dos usuarios en el grupo.',
    usage: '$divorciarse @usuario',
    necesitaMetadata: true, // Necesita metadata para la gestión de menciones y verificación de grupo.
};