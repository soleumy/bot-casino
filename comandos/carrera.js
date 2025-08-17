// comandos/carreras.js

const carreras = new Map(); // Almacena carreras activas, persiste entre llamadas al comando

export default async function carrerasHandler(sock, m, args, extra) {
    // Destructurar datos relevantes de 'extra'
    const { remitente, jid, db, guardarEconomia, obtenerDatosDelChat, isGroup } = extra;

    // Obtener los datos del usuario que envió el mensaje
    const user = obtenerDatosDelChat(jid, remitente, isGroup);

    // --- Validación de entrada (Llamada inicial del comando) ---
    if (!args[0] || !args[1]) {
        return sock.sendMessage(jid, {
            text: '🏎️ *¡Bienvenidos al Gran Premio! Haz tu apuesta:*\n\n`$carrera <número de Monoplaza 1-5> <cantidad de Fichas a apostar>`\n\n_Ejemplo:_ `$carrera 3 100`',
        }, { quoted: m });
    }

    const monoplaza = parseInt(args[0]);
    const apuesta = parseInt(args[1]);

    if (isNaN(monoplaza) || monoplaza < 1 || monoplaza > 5) {
        return sock.sendMessage(jid, {
            text: '✕ *Jefe de Equipo dice:*\n"Por favor, elige un número de Monoplaza válido entre *1 y 5* para esta carrera."',
        }, { quoted: m });
    }

    if (isNaN(apuesta) || apuesta <= 0) {
        return sock.sendMessage(jid, {
            text: '💰 *Gerente de Pistas dice:*\n"La cantidad de Fichas para tu apuesta es inválida. Debe ser un número positivo."',
        }, { quoted: m });
    }

    // Usar el dinero actual del remitente del objeto 'user'
    if (user.dinero < apuesta) {
        return sock.sendMessage(jid, {
            text: `✕ *El Corredor murmura:*\n"Tus Fichas actuales no son suficientes para esta apuesta, mejor guarda para la próxima vuelta."\n\n💼 Saldo actual: *${user.dinero} Fichas*`,
        }, { quoted: m });
    }

    // --- Lógica de la Carrera ---
    let carreraActual = carreras.get(jid);

    // Si no hay carrera activa en este chat, inicia una nueva
    if (!carreraActual) {
        carreraActual = {
            jugadores: [],
            enCurso: false,
            // Pasa las referencias necesarias para que iniciar/terminar Carrera puedan usar la DB global
            context: {
                sock: sock,
                db: db,
                guardarEconomia: guardarEconomia,
                jid: jid,
                obtenerDatosDelChat: obtenerDatosDelChat,
                isGroup: isGroup
            }
        };
        carreras.set(jid, carreraActual);

        await sock.sendMessage(jid, {
            text: `🚦 *¡Una nueva carrera de Monoplazas ha iniciado en esta pista, convocada por @${remitente.split('@')[0]}!* 🏁\n\n` +
                  `Tienes *30 segundos* para unirte a la emoción con el comando:\n` +
                  `\`$carrera <número de Monoplaza 1-5> <cantidad de Fichas>\`\n\n` +
                  `_¡Que la velocidad esté de tu lado!_`,
            mentions: [remitente]
        }, { quoted: m });

        // Inicia la cuenta regresiva para que comience la carrera
        setTimeout(() => iniciarCarrera(jid, sock), 30000);
    } else if (carreraActual.enCurso) {
        // Si una carrera ya está en progreso
        return sock.sendMessage(jid, {
            text: '🏎️ *El Comisario de Carrera dice:*\n"¡La carrera ya está en marcha! No puedes unirte en este momento, los motores ya están rugiendo."',
        }, { quoted: m });
    } else if (carreraActual.jugadores.find(j => j.remitente === remitente)) {
        // Si el usuario ya está registrado para esta carrera
        return sock.sendMessage(jid, {
            text: '📝 *Ingeniero de Datos te informa:*\n"¡Ya has registrado tu apuesta en esta carrera! No puedes apostar de nuevo, tu elección está sellada."',
        }, { quoted: m });
    }

    // Añadir jugador a la carrera
    carreraActual.jugadores.push({ remitente: remitente, monoplaza, apuesta });
    user.dinero -= apuesta;
    guardarEconomia(); // Marca los cambios para guardar

    return sock.sendMessage(jid, {
        text: `✅ *La pitlane ha registrado:*\n"¡@${remitente.split('@')[0]} ha apostado 💰 *${apuesta} Fichas* al veloz Monoplaza 🏎️ *#${monoplaza}*!"`,
        mentions: [remitente]
    }, { quoted: m });
};

// --- Funciones Auxiliares (fuera del export default para ser accesibles) ---

async function iniciarCarrera(jid, sock) {
    const carrera = carreras.get(jid);
    if (!carrera) {
        return sock.sendMessage(jid, { text: '❌ *Error en el sistema de carrera:*\n"No se encontró la carrera para iniciar, algo falló en la configuración."' });
    }

    // Destructure context directly
    const { db, guardarEconomia, obtenerDatosDelChat, isGroup } = carrera.context;
    const currentSock = carrera.context.sock;

    if (carrera.jugadores.length < 1) {
        carreras.delete(jid); // Limpiar
        return currentSock.sendMessage(jid, { text: '✕ *El Director de Carrera lamenta:*\n"No hay suficientes pilotos para que el Gran Premio comience. La parrilla está vacía..."' });
    }

    carrera.enCurso = true;

    const posiciones = [0, 0, 0, 0, 0]; // Posición para cada Monoplaza (0-indexado)
    const longitudPista = 20; // Longitud de la pista

    await currentSock.sendMessage(jid, { text: '🎬 *¡El Gran Premio ha comenzado! ¡Que la velocidad y la estrategia decidan al campeón!*' });

    // Simular el progreso de la carrera
    for (let paso = 0; paso < 25; paso++) { // Máximo 25 pasos para evitar bucles infinitos
        const avances = posiciones.map((pos, i) => {
            // Cada Monoplaza tiene una probabilidad de avanzar
            const avance = Math.random() < 0.7 ? 1 : 0; // 70% de probabilidad de avanzar 1 paso
            posiciones[i] += avance;
            return posiciones[i];
        });

        const render = avances.map((p, i) => {
            const pistaCompleta = '─'.repeat(Math.min(p, longitudPista)) + '🏎️' + '─'.repeat(Math.max(0, longitudPista - p));
            return `*Monoplaza ${i + 1}* |${pistaCompleta}|`;
        }).join('\n');

        await currentSock.sendMessage(jid, { text: render });

        // Verificar si algún Monoplaza ha llegado al final
        const ganadorIndex = avances.findIndex(p => p >= longitudPista);
        if (ganadorIndex !== -1) {
            await terminarCarrera(jid, ganadorIndex + 1);
            return; // Terminar la simulación de la carrera
        }

        await new Promise(res => setTimeout(res, 1500)); // Pausa de 1.5 segundos para efecto visual
    }

    // Si ningún Monoplaza terminó después de todos los pasos
    await currentSock.sendMessage(jid, { text: '◇ ◇ ◇  *El Control de Carrera anuncia:*\n"¡Bandera roja! Ningún Monoplaza cruzó la meta a tiempo. ¡La carrera se declara un empate por tiempo, no hay ganador claro!"' });
    carreras.delete(jid); // Limpiar los datos de la carrera
    guardarEconomia(); // Asegurar que los cambios se guarden incluso en un empate
}

async function terminarCarrera(jid, monoplazaGanador) {
    const carrera = carreras.get(jid);
    if (!carrera) return;

    const ganadoresApostadores = carrera.jugadores.filter(j => j.monoplaza === monoplazaGanador);

    let textoResultado = `🏁 *¡Fin del Gran Premio!* 🏆\n\n🏎️ El Monoplaza victorioso es: *Monoplaza #${monoplazaGanador}* 🎉\n\n`;
    const mencionesFinales = [];

    // Usar el contexto almacenado en el objeto de la carrera para acceder a la DB global y la función de guardar
    const { db, guardarEconomia, obtenerDatosDelChat, isGroup, sock: currentSock } = carrera.context;

    if (ganadoresApostadores.length === 0) {
        textoResultado += '◇ ◇ ◇  *El comentarista dice:*\n"Nadie apostó por el Monoplaza ganador. ¡La suerte no sonrió a ningún apostador en esta ocasión!"';
    } else {
        textoResultado += '*¡Felicidades a los estrategas que apostaron al ganador!* 🎊\n';
        for (const ganador of ganadoresApostadores) {
            const winnerUserData = obtenerDatosDelChat(jid, ganador.remitente, isGroup);

            const ganancia = ganador.apuesta * 4; // La ganancia es 4x la apuesta
            winnerUserData.dinero += ganancia; // Añadir ganancias al dinero del usuario

            textoResultado += `\n🎉 @${ganador.remitente.split('@')[0]} ha ganado 💰 *${ganancia} Fichas*.`;
            mencionesFinales.push(ganador.remitente);
        }
    }

    // Marcar que los datos de la economía han cambiado
    guardarEconomia();

    await currentSock.sendMessage(jid, {
        text: textoResultado.trim(),
        mentions: mencionesFinales
    });

    carreras.delete(jid); // Limpiar los datos de la carrera para este chat
}

export const config = {
    name: 'carrera',
    alias: ['race', 'f1', 'gp'], // Alias más temáticos de F1
    description: 'Organiza una carrera de Monoplazas donde los usuarios pueden apostar sus Fichas por el vehículo ganador, como en un Gran Premio de Fórmula 1.',
    usage: '$carrera <número de Monoplaza 1-5> <cantidad de Fichas>',
    necesitaMetadata: false,
};