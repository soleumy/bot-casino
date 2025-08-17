// comandos/jugar.js

export default async function jugarHandler(sock, m, args, extra) {
    const { jid, remitente, user, chatConfig, guardarEconomia } = extra;

    // Asegúrate de que el bot esté activo en el grupo
    if (chatConfig.activo === false) {
        return sock.sendMessage(jid, { text: '🔒 El bot está desactivado en este grupo. Usa *$activar* para reactivarlo.' }, { quoted: m });
    }

    const costoPartida = 1000; // Costo fijo por jugar una partida del casino
    const cooldown = 5 * 60 * 1000; // 5 minutos de cooldown
    const ahora = Date.now();

    // Verificar si el usuario tiene suficiente dinero para jugar
    if (user.dinero < costoPartida) {
        return sock.sendMessage(jid, {
            text: `💸 *Fondos insuficientes:*\n"Necesitas 💰 ${costoPartida} para jugar una partida. Tu saldo actual es de 💰 ${user.dinero}."\n\n_Intenta ganar más dinero con: *$trabajar* o *$apostar*_'`
        }, { quoted: m });
    }

    // Verificar el cooldown específico para el juego de casino
    if (user.ultimoJuego && (ahora - user.ultimoJuego < cooldown)) {
        const tiempoRestante = cooldown - (ahora - user.ultimoJuego);
        const minutos = Math.floor(tiempoRestante / (60 * 1000));
        const segundos = Math.floor((tiempoRestante % (60 * 1000)) / 1000);
        return sock.sendMessage(jid, { text: `🎰 *¡Espera, ${remitente.split('@')[0]}!* Las mesas de juego están ocupadas. Inténtalo de nuevo en *${minutos}m ${segundos}s*.` }, { quoted: m });
    }

    // El usuario paga el costo de la partida antes de jugar
    user.dinero -= costoPartida;

    const resultadosJuego = [
        // Resultados y sus probabilidades. Asegúrate de que las chances sumen 1 (o 100%)
        { tipo: "Pésimo juego", dineroImpacto: -10000, xpGanada: 5, chance: 0.10, emoji: '📉' }, // 10%
        { tipo: "Mal juego", dineroImpacto: -1000, xpGanada: 5, chance: 0.25, emoji: '🔻' }, // 25%
        { tipo: "Buen juego", dineroImpacto: 1000, xpGanada: 10, chance: 0.40, emoji: '📈' }, // 40%
        { tipo: "Excelente juego", dineroImpacto: 10000, xpGanada: 20, chance: 0.25, emoji: '💎' }  // 25%
    ];

    let resultadoFinal = null;
    let acumuladoChance = 0;
    const rand = Math.random(); // Genera un número aleatorio entre 0 y 1

    for (const res of resultadosJuego) {
        acumuladoChance += res.chance;
        if (rand < acumuladoChance) {
            resultadoFinal = res;
            break;
        }
    }

    // Fallback por si acaso no se elige ninguno (aunque con chances que suman 1, no debería pasar)
    if (!resultadoFinal) {
        resultadoFinal = { tipo: "Juego neutral", dineroImpacto: 0, xpGanada: 0, emoji: '🎲' };
    }

    // Aplicar el impacto del dinero
    user.dinero = (user.dinero || 0) + resultadoFinal.dineroImpacto;
    user.experiencia = (user.experiencia || 0) + resultadoFinal.xpGanada;

    // Asegurarse de que el dinero no baje de 0
    if (user.dinero < 0) {
        user.dinero = 0;
    }

    // Actualiza el tiempo del último juego
    user.ultimoJuego = ahora;

    // Mensaje de resultado
    let mensaje = `♟️ ¡Has jugado un *${resultadoFinal.tipo}*!\n`;
    if (resultadoFinal.dineroImpacto > 0) {
        mensaje += `Has ganado 💰 ${resultadoFinal.dineroImpacto} de Dinero\n`;
    } else if (resultadoFinal.dineroImpacto < 0) {
        mensaje += `Has perdido 💰 ${Math.abs(resultadoFinal.dineroImpacto)} de Dinero\n`;
    } else {
        mensaje += `Tu dinero no ha cambiado.\n`;
    }
    mensaje += `- Has ganado ${resultadoFinal.xpGanada} de experiencia\n\n`;

    // Lógica de subida de nivel
    let nivelMensaje = '';
    const nivelAnterior = user.nivel;
    while (user.experiencia >= (user.nivel * 100)) { // XP necesaria para subir de nivel (Nivel * 100)
        user.experiencia -= (user.nivel * 100);
        user.nivel += 1;
        nivelMensaje += `✨ *¡${remitente.split('@')[0]} ha alcanzado el Nivel ${user.nivel}!* ¡Tu habilidad en el juego ha mejorado!\n`;
    }

    guardarEconomia();

    await sock.sendMessage(jid, {
        text: `${mensaje}${nivelMensaje}Dinero actual: ${user.dinero} 💰\nNivel: ${user.nivel} (XP: ${user.experiencia})`
    }, { quoted: m });
}

export const config = {
    name: 'jugar',
    alias: ['casino', 'play'],
    description: 'Permite al usuario jugar un juego de casino para ganar o perder dinero y experiencia.',
    usage: '$jugar',
    necesitaMetadata: false,
};