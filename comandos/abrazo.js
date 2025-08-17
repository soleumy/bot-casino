// abrazo.js

export default async function abrazoHandler(sock, m, args, extra) {
    const menciones = m.message?.extendedTextMessage?.contextInfo?.mentionedJid;

    if (!menciones || menciones.length < 1) {
        await sock.sendMessage(
            m.key.remoteJid,
            { text: 'Para enviar un abrazo, debes mencionar a un usuario. Ejemplo: *$abrazo @usuario*' },
            { quoted: m }
        );
        return;
    }

    const remitente = m.key.participant || m.key.remoteJid;
    const objetivo = menciones[0];

    // Inicializar base de datos de abrazos si no existe
    extra.db._abrazos = extra.db._abrazos || {};

    // Clave única para la pareja (ordenada alfabéticamente)
    const ids = [remitente, objetivo].sort();
    const clave = `${ids[0]}|${ids[1]}`;

    // Aumentar contador
    extra.db._abrazos[clave] = (extra.db._abrazos[clave] || 0) + 1;
    const total = extra.db._abrazos[clave];

    const texto = `🫂 @${remitente.split('@')[0]} le ha dado un abrazo a @${objetivo.split('@')[0]}!\n\n> Han compartido *${total} abrazo${total === 1 ? '' : 's'}*.`;

    await sock.sendMessage(
        m.key.remoteJid,
        {
            video: {
                url: 'https://media1.tenor.com/m/J7eGDvGeP9IAAAAC/enage-kiss-anime-hug.mp4' // Manteniendo el GIF original
            },
            gifPlayback: true,
            caption: texto,
            mentions: [remitente, objetivo]
        },
        { quoted: m }
    );

    // No olvides guardar los cambios en la DB
    if (typeof extra.guardarEconomia === 'function') {
        extra.guardarEconomia();
    }
}

export const config = {
    name: 'abrazo',
    alias: ['hug', 'abrazar'],
    description: 'Envía un abrazo a un usuario y cuenta cuántos abrazos han compartido.',
    usage: '$abrazo @usuario',
    necesitaMetadata: false,
};