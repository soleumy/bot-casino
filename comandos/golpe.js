export default async (sock, m, args, extra) => {
    const { jid, db } = extra;

    const remitente = m.key.participant || m.key.remoteJid;
    const mencionados = m.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];

    if (mencionados.length === 0) {
        return sock.sendMessage(
            jid,
            { text: '❌ Debes mencionar a un usuario para golpearlo. Ejemplo: *$golpe @usuario*' },
            { quoted: m }
        );
    }

    const objetivo = mencionados[0];

    // No se puede golpear a uno mismo o al bot
    const botId = sock.user?.id?.split(':')[0] + '@s.whatsapp.net';
    if (objetivo === remitente) {
        return sock.sendMessage(jid, { text: '❌ No puedes golpearte a ti mismo.' }, { quoted: m });
    }
    if (objetivo === botId) {
        return sock.sendMessage(jid, { text: '❌ No puedes golpearme a mí.' }, { quoted: m });
    }

    // Inicializar base de datos de golpes si no existe
    db._golpes = db._golpes || {};

    // Sumar al contador del objetivo
    // La clave para los golpes será el JID del objetivo
    db._golpes[objetivo] = (db._golpes[objetivo] || 0) + 1;
    const totalGolpesObjetivo = db._golpes[objetivo];

    // Marcar los cambios para que se guarden en la base de datos
    extra.guardarEconomia();

    const texto = `
💥 ${remitente.split('@')[0]} ha golpeado a ${objetivo.split('@')[0]}.

Este usuario ha sido golpeado *${totalGolpesObjetivo} vez${totalGolpesObjetivo === 1 ? '' : 'es'}.*
`;

    // URL del GIF que proporcionaste
    const gifUrl = 'https://media.tenor.com/BoYBoopIkBcAAAPo/anime-smash.mp4';

    await sock.sendMessage(
        jid,
        {
            video: { url: gifUrl },
            gifPlayback: true,
            caption: texto,
            mentions: [remitente, objetivo]
        },
        { quoted: m }
    );
};

export const config = {
    name: 'golpe',
    alias: ['hit', 'smash', 'pegar', 'tapar'], // Añadido 'tapar' como alias neutral
    description: 'Permite a los usuarios "golpear" o "tocar" a otros usuarios y mantiene un conteo de los impactos.',
    usage: '$golpe @usuario',
    necesitaMetadata: true, // Necesita metadata del grupo para las menciones.
};