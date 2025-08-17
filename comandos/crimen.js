// comandos/crimen.js

// Map para almacenar los cooldowns por usuario para el comando $crimen
const cooldownsCrimen = new Map();

export default async function crimenHandler(sock, m, args, extra) {
    const chatJid = m.key.remoteJid;
    const remitente = m.key.participant || m.key.remoteJid;

    const user = extra.user;

    // --- Cooldown Check ---
    const ahora = Date.now();
    const ultimoCrimen = cooldownsCrimen.get(remitente) || 0;
    const cooldownTiempo = 5 * 60 * 1000; // 5 minutos de cooldown

    if (ahora - ultimoCrimen < cooldownTiempo) {
        const segundosRestantes = Math.ceil((cooldownTiempo - (ahora - ultimoCrimen)) / 1000);
        let mensajeTiempo;
        if (segundosRestantes < 60) {
            mensajeTiempo = `${segundosRestantes} segundo(s)`;
        } else {
            const minutos = Math.floor(segundosRestantes / 60);
            const segundos = segundosRestantes % 60;
            mensajeTiempo = `${minutos} minuto(s)`;
            if (segundos > 0) {
                mensajeTiempo += ` y ${segundos} segundo(s)`;
            }
        }
        return sock.sendMessage(
            chatJid,
            { text: `◇ 𝗖𝖱𝖴𝖯𝗜𝗘𝗥 ◇\n\n⏳ *¡Espera, jugador!* El Crupier dice que aún no es tu turno. Podrás intentar tu suerte de nuevo en *${mensajeTiempo}*.\n_¡No fuerces la banca!_` },
            { quoted: m }
        );
    }

    // Lista de "hazañas" (juegos o intentos de robo)
    const hazañas = [
        {
            descripcion: 'vaciar una de las tragaperras VIP sin ser detectado',
            ganancia: () => Math.floor(Math.random() * 800 + 300), // Gana entre 300 y 1100 Fichas
            exito: 0.3 // 30% de éxito
        },
        {
            descripcion: 'distraer al Crupier de la mesa de Blackjack para llevarse unas fichas',
            ganancia: () => Math.floor(Math.random() * 400 + 200), // Gana entre 200 y 600 Fichas
            exito: 0.45 // 45% de éxito
        },
        {
            descripcion: 'cambiar una carta en la mesa de Poker en un descuido del repartidor',
            ganancia: () => Math.floor(Math.random() * 300 + 150), // Gana entre 150 y 450 Fichas
            exito: 0.5 // 50% de éxito
        },
        {
            descripcion: 'manipular la ruleta para que caiga en tu número secreto',
            ganancia: () => Math.floor(Math.random() * 600 + 250), // Gana entre 250 y 850 Fichas
            exito: 0.35 // 35% de éxito
        },
        {
            descripcion: 'convencer a un apostador despistado de que te preste sus fichas "por un momento"',
            ganancia: () => Math.floor(Math.random() * 500 + 180), // Gana entre 180 y 680 Fichas
            exito: 0.4 // 40% de éxito
        }
    ];

    // Elegir una hazaña aleatoria
    const hazaña = hazañas[Math.floor(Math.random() * hazañas.length)];
    let probabilidadExito = hazaña.exito;

    // --- Modificadores de éxito basados en estados del usuario (suerte) ---
    user.estados ??= {}; // Asegurarse de que `estados` exista
    if (user.estados.suerte && user.estados.suerte > ahora) {
        probabilidadExito += 0.10; // Ejemplo: Si tiene 'suerte', aumenta la probabilidad de éxito en un 10%
        // delete user.estados.suerte; // Descomentar si el efecto de suerte es de un solo uso
    }
    // Puedes añadir más modificadores aquí (por ejemplo, basados en `user.fuerza` o ítems de inventario)

    let resultado = Math.random() < probabilidadExito;

    if (resultado) {
        const ganancia = hazaña.ganancia();
        user.dinero += ganancia;

        // Set cooldown
        cooldownsCrimen.set(remitente, ahora);

        extra.guardarEconomia();

        return sock.sendMessage(
            chatJid,
            {
                text: `◇ 𝗖𝖱𝖴𝗣𝗜𝗘𝗥 ◇\n\n✨ ¡Jackpot! @${remitente.split('@')[0]} logró *${hazaña.descripcion}*.\n🎉 Ha ganado 💰 *${ganancia} Fichas*. ¡Bien jugado!`,
                mentions: [remitente],
            },
            { quoted: m }
        );
    } else {
        let perdida = Math.floor(Math.random() * 300 + 80); // Pierde entre 80 y 380 Fichas

        // --- Modificadores de pérdida basados en estados del usuario (proteccionPerdida) ---
        if (user.estados.proteccionPerdida && user.estados.proteccionPerdida > ahora) {
            perdida = Math.floor(perdida / 2); // Si tiene 'proteccionPerdida', reduce la pérdida a la mitad
            // delete user.estados.proteccionPerdida; // Descomentar si el efecto es de un solo uso
        }

        user.dinero = Math.max(0, user.dinero - perdida);

        // Set cooldown
        cooldownsCrimen.set(remitente, ahora);

        extra.guardarEconomia();

        return sock.sendMessage(
            chatJid,
            {
                text: `◇ 𝗖𝖱𝖴𝖯𝗜𝗘𝗥 ◇\n\n🚨 ¡Alerta de seguridad! @${remitente.split('@')[0]} intentó *${hazaña.descripcion}*, pero fue interceptado por la seguridad del casino.\n💸 Perdió 💰 *${perdida} Fichas* en el intento. ¡Mejor suerte la próxima vez, jugador!`,
                mentions: [remitente],
            },
            { quoted: m }
        );
    }
};

export const config = {
    name: 'crimen',
    alias: ['heist', 'delito'],
    description: 'Permite al Crupier desafiar la suerte con un "riesgo" de casino, pudiendo ganar o perder Fichas. Tiene un cooldown.',
    usage: '$crimen',
    necesitaMetadata: false, // No necesita metadata de grupo.
};