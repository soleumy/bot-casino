export default async (sock, m) => {
    const mencionados =
        m.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];

    if (!mencionados || mencionados.length < 2) {
        await sock.sendMessage(
            m.key.remoteJid,
            {
                text: '❌ Debes mencionar a dos usuarios para calcular la compatibilidad. Ejemplo: *$ship @usuario1 @usuario2*'
            },
            { quoted: m }
        );
        return;
    }

    const [a, b] = mencionados;

    const porcentaje = Math.floor(Math.random() * 101);
    const barra =
        '█'.repeat(Math.floor(porcentaje / 10)) +
        '░'.repeat(10 - Math.floor(porcentaje / 10));

    let nivelCompatibilidad = '';
    if (porcentaje >= 90) nivelCompatibilidad = 'Muy alta compatibilidad.';
    else if (porcentaje >= 70) nivelCompatibilidad = 'Alta compatibilidad.';
    else if (porcentaje >= 50) nivelCompatibilidad = 'Compatibilidad moderada.';
    else if (porcentaje >= 30) nivelCompatibilidad = 'Baja compatibilidad.';
    else nivelCompatibilidad = 'Muy baja compatibilidad.';

    const mensaje = `--- Calculadora de Compatibilidad ---\n\n@${a.split('@')[0]} y @${b.split('@')[0]}\n\nPorcentaje de Compatibilidad: *${porcentaje}%*\n[${barra}]\n\n${nivelCompatibilidad}`;

    await sock.sendMessage(
        m.key.remoteJid,
        {
            text: mensaje,
            mentions: [a, b],
        },
        { quoted: m }
    );
};

export const config = {
    name: 'ship',
    alias: ['compatibilidad', 'match'],
    description: 'Calcula un porcentaje de compatibilidad aleatorio entre dos usuarios mencionados.',
    usage: '$ship @usuario1 @usuario2',
    necesitaMetadata: false, // No necesita metadata de grupo.
};