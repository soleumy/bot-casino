// comandos/apostar.js

export default async function apostarHandler(sock, m, args, extra) {
    const chatJid = m.key.remoteJid;
    const remitente = m.key.participant || m.key.remoteJid;

    const user = extra.user;

    // Ensure 'dinero' property exists
    user.dinero ??= 0;

    const dineroActual = user.dinero;
    const cantidad = parseInt(args[0]);

    if (isNaN(cantidad) || cantidad <= 0) {
        return sock.sendMessage(chatJid, {
            text: '♠️ *Instrucciones del Casino:*\n"Debes apostar una cantidad válida de dinero para que la ruleta gire, querido jugador."'
        }, { quoted: m });
    }

    if (cantidad > dineroActual) {
        return sock.sendMessage(chatJid, {
            text: '💸 *Fondos insuficientes:*\n"Tu saldo actual no es suficiente para esta apuesta. Vuelve cuando tengas más fichas en tu bolsillo."'
        }, { quoted: m });
    }

    // 50/50 probability, like a coin toss
    const gano = Math.random() < 0.5;

    if (gano) {
        const ganancia = cantidad; // Win the exact amount you bet
        user.dinero += ganancia;

        if (typeof extra.guardarEconomia === 'function') {
            extra.guardarEconomia();
        }
        return sock.sendMessage(chatJid, {
            text: `🎰 Con una sonrisa serena, observa cómo las luces del casino celebran tu victoria:
—Parece que esta vez la fortuna decidió ponerse de tu lado… 

Has ganado 💸 ${ganancia} Dinero.
💼 Tu fortuna actual: ${user.dinero}.`,
            mentions: [remitente],
        }, { quoted: m });
    } else {
        user.dinero -= cantidad; // Lose the amount you bet

        if (typeof extra.guardarEconomia === 'function') {
            extra.guardarEconomia();
        }
        return sock.sendMessage(chatJid, {
            text: `🪙 *Se observa la ruleta detenerse y:*
—La suerte no estuvo de tu lado esta vez, querido...

Has perdido 💸 ${cantidad} Dinero.
💼 Dinero restante: ${user.dinero}.`,
            mentions: [remitente],
        }, { quoted: m });
    }
}

export const config = {
    name: 'apostar',
    alias: ['bet', 'riesgo', 'ruleta'],
    description: 'Permite al usuario apostar dinero en el casino con un 50/50 de ganar o perder.',
    usage: '$apostar <cantidad>',
    necesitaMetadata: false,
};