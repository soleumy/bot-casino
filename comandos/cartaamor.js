// comandos/cartaamor.js

export default async function cartaAmorHandler(sock, m, args, extra) {
    const { jid, isGroup } = extra;

    if (!isGroup) {
        return sock.sendMessage(jid, {
            text: '✕ Este comando solo puede ser usado en grupos.',
        }, { quoted: m });
    }

    const metadata = await sock.groupMetadata(jid);
    const participants = metadata.participants;

    if (!participants || participants.length < 3) {
        return sock.sendMessage(
            jid,
            {
                text: '❌ Se necesitan al menos 3 miembros en el grupo para usar este comando.',
            },
            { quoted: m }
        );
    }

    const remitente = m.key.participant || m.participant;
    const botId = sock.user?.id?.split(':')[0] + '@s.whatsapp.net';

    const menciones = m.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];

    let destinatarioId;

    if (menciones.length > 0) {
        // Usar la primera mención distinta al remitente y al bot
        destinatarioId = menciones.find(id => id !== remitente && id !== botId);
    }

    if (!destinatarioId) {
        // Si no hay mención válida, elegir al azar excluyendo remitente y bot
        const validos = participants
            .map(p => p.id)
            .filter(id => id !== remitente && id !== botId && id.endsWith('@s.whatsapp.net')); // Solo JIDs de usuarios

        if (validos.length === 0) {
            return sock.sendMessage(
                jid,
                { text: '✕ No se encontró ningún usuario válido para enviar el mensaje.' },
                { quoted: m }
            );
        }
        destinatarioId = validos[Math.floor(Math.random() * validos.length)];
    }

    const remitenteTag = `@${remitente.split('@')[0]}`;
    const destinatarioTag = `@${destinatarioId.split('@')[0]}`;

    // Contenido de la carta de amor genuina
    const carta =
        ` *Para ti, ${destinatarioTag}* \n\n` +
        `De: ${remitenteTag}\n\n` +
        `"Cada vez que te veo, mi mundo se ilumina. Eres la razón por la que mi corazón late un poco más fuerte. ` +
        `Gracias por ser tú, por cada risa, cada momento compartido y por la simple alegría de tu existencia. ` +
        `Eres increíble y mi cariño por ti crece cada día."\n\n` +
        `Con todo mi afecto,`;

    const imagenUrl = 'https://i.pinimg.com/736x/f5/98/b8/f598b8d3394efecf461258cba689af8a.jpg'; // Manteniendo la imagen original.

    try {
        await sock.sendMessage(
            jid,
            {
                image: { url: imagenUrl },
                caption: carta,
                mentions: [remitente, destinatarioId],
            },
            { quoted: m }
        );
    } catch (error) {
        console.error("Error al enviar la carta de amor:", error);
        await sock.sendMessage(jid, {
            text: '✕ Ocurrió un error al intentar enviar la carta de amor. Por favor, intenta de nuevo más tarde.'
        }, { quoted: m });
    }
};

export const config = {
    name: 'cartaamor',
    alias: ['loveletter', 'amor'], // Alias que sugieren "carta de amor"
    description: 'Envía una carta de amor a un miembro del grupo, ya sea mencionado o elegido al azar.',
    usage: '$cartaamor [@usuario opcional]',
    necesitaMetadata: true, // Necesita metadatos del grupo para obtener participantes.
};