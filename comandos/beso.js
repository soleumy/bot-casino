// comandos/beso.js

export default async function besoHandler(sock, m, args, extra) {
    const menciones = m.message?.extendedTextMessage?.contextInfo?.mentionedJid;

    if (!menciones || menciones.length < 1) {
        await sock.sendMessage(
            m.key.remoteJid,
            {
                text: '💬 *Mensaje del Bot:*\n"Para dar un beso, debes mencionar a un usuario. Ejemplo: *$beso @usuario*"'
            },
            { quoted: m }
        );
        return;
    }

    const remitente = m.key.participant || m.participant || m.key.remoteJid;
    const objetivo = menciones[0];

    // Inicializar base de datos si no existe
    extra.db._besos = extra.db._besos || {};

    // Crear una clave ordenada alfabéticamente para la pareja
    const ids = [remitente, objetivo].sort();
    const clave = `${ids[0]}|${ids[1]}`;

    // Incrementar el contador de besos
    extra.db._besos[clave] = (extra.db._besos[clave] || 0) + 1;
    const total = extra.db._besos[clave];

    const texto = `💖 ¡@${remitente.split('@')[0]} le ha dado un beso a @${objetivo.split('@')[0]}!\n\n> Esta conexión ya suma *${total} beso${total === 1 ? '' : 's'}* en total.`;

    await sock.sendMessage(
        m.key.remoteJid,
        {
            video: {
                url: 'https://media1.tenor.com/m/_RhZ68OdXLwAAAAC/gay-anime.mp4', // Manteniendo el GIF original
            },
            gifPlayback: true,
            caption: texto,
            mentions: [remitente, objetivo],
        },
        { quoted: m }
    );

    // No olvides guardar los cambios en la DB
    if (typeof extra.guardarEconomia === 'function') {
        extra.guardarEconomia();
    }
};

export const config = {
    name: 'beso',
    alias: ['kiss', 'afecto'], // Alias neutrales
    description: 'Registra y muestra la cantidad de "besos" o muestras de afecto compartidas entre dos usuarios. Mantiene un contador y muestra un GIF.',
    usage: '$beso @usuario',
    necesitaMetadata: false,
};