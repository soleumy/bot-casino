export default async (sock, m, args, extra) => {
    const chatJid = m.key.remoteJid; 
    const remitente = m.key.participant || m.key.remoteJid; 

    const user = extra.user;

    user.dinero ??= 0;
    user.banco ??= 0;

    const cantidad = parseInt(args[0]);

    if (isNaN(cantidad) || cantidad <= 0) {
        return sock.sendMessage(
            chatJid,
            {
                text: '◇ 𝗖𝖱𝖴𝖯𝗜𝗘𝗥 ◇\n\n🃏 *¡Atención, jugador!* Necesitas apostar una cantidad válida y positiva. ¡Las fichas deben ser reales!'
            },
            { quoted: m }
        );
    }

    // Verificar si el usuario tiene suficiente dinero en mano para depositar
    if (user.dinero < cantidad) {
        return sock.sendMessage(
            chatJid,
            {
                text: `◇ 𝗖𝖱𝖴𝖯𝗜𝗘𝗥 ◇\n\n💸 *¡Ups!* Parece que no tienes *${cantidad} Fichas* en tu mano para esta jugada.
🎲 *Fichas en mano:* ${user.dinero}
🏦 *Fichas en la caja fuerte:* ${user.banco}`
            },
            { quoted: m }
        );
    }

    // Realizar el depósito
    user.dinero -= cantidad; 
    user.banco += cantidad;  

    // Marcar para guardar los cambios
    if (typeof extra.guardarEconomia === 'function') {
        extra.guardarEconomia();
    }

    // Mensaje de confirmación
    return sock.sendMessage(
        chatJid,
        {
            text: `◇ 𝗖𝖱𝖴𝖯𝗜𝗘𝗥 ◇\n\n♦️  ¡@${remitente.split('@')[0]} ha depositado *${cantidad} Fichas* en la caja fuerte del casino!
🎲 *Fichas en mano:* ${user.dinero}
🏦 *Fichas en la caja fuerte:* ${user.banco}`,
            mentions: [remitente]
        },
        { quoted: m }
    );
};

export const config = {
    name: 'ingresar',
    alias: ['depositar', 'deposit'],
    description: 'Permite a los usuarios depositar sus fichas en el banco del casino, bajo la supervisión del Crupier.',
    usage: '$ingresar <cantidad>',
    cooldown: 5, 
};