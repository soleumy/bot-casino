export default async (sock, m, args) => {
    const opciones = ['piedra', 'papel', 'tijera'];
    // Redefiniendo emojiMap con símbolos estéticos
    const simboloMap = {
        piedra: '▰', // Cuadrado sólido
        papel: '♦', // Diamante
        tijera: '✁'  // Tijeras estilizadas
    };

    const eleccionUsuario = (args[0] || '').toLowerCase();

    if (!opciones.includes(eleccionUsuario)) {
        return sock.sendMessage(m.key.remoteJid, {
            text: `◇ 𝗖𝖱𝖴𝖯𝗜𝗘𝗥 ◇\n"¡Oiga! Necesito una apuesta clara. Elija su jugada, joven: *piedra*, *papel*, o *tijera*.\n\nEjemplo:\n$ppt piedra\n$ppt papel\n$ppt tijera"`
        }, { quoted: m });
    }

    const eleccionBot = opciones[Math.floor(Math.random() * opciones.length)];

    let resultado = '';
    if (eleccionUsuario === eleccionBot) {
        resultado = '◇ Empate en la mesa! La casa no pierde, y usted tampoco. ◇';
    } else if (
        (eleccionUsuario === 'piedra' && eleccionBot === 'tijera') ||
        (eleccionUsuario === 'tijera' && eleccionBot === 'papel') ||
        (eleccionUsuario === 'papel' && eleccionBot === 'piedra')
    ) {
        resultado = '◇ Felicidades, ha ganado la ronda! La suerte esta de su lado. ◇';
    } else {
        resultado = '◇ Mala suerte! La casa se lleva la victoria esta vez. ◇';
    }

    const mensaje =
        `◇ El Gran Juego del Casino: Piedra, Papel o Tijera ◇\n\n` +
        `Su jugada: ${simboloMap[eleccionUsuario]} ${eleccionUsuario}\n` +
        `La jugada del crupier: ${simboloMap[eleccionBot]} ${eleccionBot}\n\n` +
        `--- El Veredicto del Casino es: ${resultado}`;

    await sock.sendMessage(m.key.remoteJid, { text: mensaje }, { quoted: m });
};

export const config = {
    name: 'ppt',
    alias: ['piedrapapeltijera'],
    description: 'Juega Piedra, Papel o Tijera contra el crupier del casino.',
    usage: '$ppt [piedra|papel|tijera]',
    necesitaMetadata: false, // No necesita metadata de grupo.
};