// comandos/banana.js

export default async function bananaHandler(sock, m) {
    const tamaño = (Math.random() * 25).toFixed(1); // Genera un número aleatorio para el "tamaño"
    const remitente = m.key.participant || m.key.remoteJid;

    await sock.sendMessage(
        m.key.remoteJid,
        {
            text: `📏 *Medidor de Tamaño:*\n\n@${remitente.split('@')[0]}, tu "banana" es de *${tamaño} unidades*.`,
            mentions: [remitente]
        },
        { quoted: m }
    );
};

export const config = {
    name: 'banana',
    alias: ['medir', 'size'], // Alias neutrales relacionados con la medición
    description: 'Genera una medida aleatoria para un usuario.',
    usage: '$banana',
    necesitaMetadata: false,
};