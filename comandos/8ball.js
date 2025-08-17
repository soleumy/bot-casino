// comandos/8ball.js

const ball = async (sock, m, args, extra) => {
    const { jid } = extra; // 'jid' es el jid del chat donde se envió el mensaje

    if (args.length === 0) {
        return sock.sendMessage(jid, {
            text: '🎰 *La Ruleta del Destino murmura:*\n"Necesito una apuesta, una pregunta clara para girar los dados de la fortuna. ¿Qué deseas saber?"'
        }, { quoted: m });
    }

    const respuestas = [
        // Afirmativas (¡Apuesta ganadora!)
        '✅ *Jackpot a la vista:* Las cartas están a tu favor, ¡adelante!',
        '💰 *Dado de la Fortuna:* Definitivamente, la suerte te sonríe.',
        '🌟 *As de Espadas:* Es una apuesta segura, puedes confiar en ello.',
        '📈 *Ficha en verde:* Las probabilidades son altas, no hay duda.',
        '🍀 *Mano ganadora:* Todos los indicadores apuntan a un sí.',
        '🎲 *Caída perfecta:* El dado ha hablado, un rotundo sí.',

        // Negativas (¡Mala mano!)
        '✕ *Banca dice no:* La mesa se niega, es un "no" categórico.',
        '📉 *Fichas en rojo:* No es el momento, la suerte no te acompaña aquí.',
        '🃏 *Comodín invertido:* Mejor abstenerse, la fortuna no está de tu lado.',
        '🚫 *Juego cerrado:* Absolutamente no, guarda tus apuestas para otra ocasión.',
        '🛑 *Ronda perdida:* Las cartas no mienten, la respuesta es no.',

        // Dudas / Intermedias (¡Pase o mire!)
        '❓ *Pase o mire:* La fortuna es caprichosa, intenta tu suerte de nuevo.',
        '🤔 *Apuesta incierta:* Las fichas se dispersan, no hay claridad aún.',
        '🌀 *Baraja mezclada:* Es difícil decirlo, las cartas aún se están revelando.',
        '🎲 *Dados en el aire:* El resultado está en el viento, nada es seguro.',
        '♠️ *Carta oculta:* El destino aún no ha revelado su mano. Revisa tu apuesta más tarde.'
    ];

    const resp = respuestas[Math.floor(Math.random() * respuestas.length)];

    await sock.sendMessage(jid, {
        text: `🃏 *El Crupier del Destino ha recibido tu pregunta:*\n"${args.join(' ')}"\n\n${resp}`
    }, { quoted: m });
};

// Exporta la función como default y la configuración como una exportación nombrada
export default ball;
export const config = {
    name: '8ball',
    alias: ['pregunta', 'oraculo', 'ruleta', 'dado'], // Añadidos alias de casino
    description: 'Pregunta al Oráculo del Casino. El $8ball te revelará las probabilidades y la fortuna de tu cuestión.',
    usage: '$8ball <tu pregunta>',
    necesitaMetadata: false, // No necesita metadatos del grupo para este comando
};