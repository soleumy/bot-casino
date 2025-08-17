// comandos/robar.js
// Map to store cooldowns for the $robar command
const cooldownsRobar = new Map();

export default async (sock, m, args, { jid, remitente, user, db, guardarEconomia }) => {
    const attackerData = user; // 'user' es el objeto de datos del remitente (atacante)

    const mentions = m.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];

    let victimJid;
    let amount;

    // Argument parsing: Check for mention and amount
    if (mentions.length > 0) {
        victimJid = mentions[0];
        amount = parseInt(args[1]); // Amount is the second argument if there's a mention
    } else {
        // Si no hay mención, el comando es inválido para un robo
        amount = parseInt(args[0]); // Intenta parsear el primer argumento para el mensaje de uso
    }

    // --- Input Validation ---
    if (!victimJid || isNaN(amount) || amount <= 0) {
        return sock.sendMessage(
            jid,
            { text: '◇ 𝗖𝖱𝖴𝖯𝗜𝗘𝗥 ◇\n"Para intentar un robo en el Casino, debes especificar a quién y cuánto.\n\n$robar @jugador <cantidad>\n\nEjemplo: $robar @suertudo 500"' },
            { quoted: m }
        );
    }

    // Obtener los datos de la víctima
    const victimData = db[jid]?.users?.[victimJid];

    if (!victimData) {
        return sock.sendMessage(
            jid,
            { text: `◇ 𝗖𝖱𝖴𝖯𝗜𝗘𝗥 ◇\n"El jugador @${victimJid.split('@')[0]} no esta registrado en los libros del casino. No puedes robar a quien no ha apostado."` },
            { mentions: [victimJid], quoted: m }
        );
    }

    // Prevenir el auto-robo
    if (victimJid === remitente) {
        return sock.sendMessage(
            jid,
            { text: `◇ 𝗖𝖱𝖴𝖯𝗜𝗘𝗥 ◇\n"No puedes robarte a ti mismo, tramposo. Busca a otro jugador en el salon."` },
            { quoted: m }
        );
    }

    // Prevenir el robo al bot
    const botId = sock.user?.id?.split(':')[0] + '@s.whatsapp.net';
    if (victimJid === botId) {
        return sock.sendMessage(jid, { text: '◇ 𝗖𝖱𝖴𝖯𝗜𝗘𝗥 ◇\n"¡Intento de robo a la casa! La seguridad del casino es impenetrable, joven. Mis fichas son inalcanzables."' }, { quoted: m });
    }

    // --- Cooldown Check for Attacker ---
    const ahora = Date.now();
    const ultimoRobo = cooldownsRobar.get(remitente) || 0;
    const cooldownTiempo = 1 * 60 * 60 * 1000; // 1 hora de cooldown para robar

    if (ahora - ultimoRobo < cooldownTiempo) {
        const segundosRestantes = Math.ceil((cooldownTiempo - (ahora - ultimoRobo)) / 1000);
        const minutosRestantes = Math.ceil(segundosRestantes / 60);
        return sock.sendMessage(
            jid,
            { text: `◇ 𝗖𝖱𝖴𝖯𝗜𝗘𝗥 ◇\n"Tus movimientos son muy predecibles. Deberas esperar ${minutosRestantes} minuto(s) antes de intentar otro 'movimiento'."` },
            { quoted: m }
        );
    }

    // --- Victim Protections ---
    // Asegurarse de que 'estados' exista
    victimData.estados ??= {};

    if (victimData.estados.proteccionRobo && victimData.estados.proteccionRobo > ahora) {
        delete victimData.estados.proteccionRobo; // La protección se consume
        guardarEconomia();
        return sock.sendMessage(
            jid,
            {
                text: `◇ 𝗖𝖱𝖴𝖯𝗜𝗘𝗥 ◇\n"¡Tu intento de robo fue frustrado! @${victimJid.split('@')[0]} estaba protegido por un Guardaespaldas VIP."`,
                mentions: [remitente, victimJid],
            },
            { quoted: m }
        );
    }

    if (victimData.estados.invisible && victimData.estados.invisible > ahora) {
        return sock.sendMessage(
            jid,
            {
                text: `◇ 𝗖𝖱𝖴𝖯𝗜𝗘𝗥 ◇\n"Imposible robar a @${victimJid.split('@')[0]}, ha usado un Camuflaje de Mesa y es invisible a tus trucos."`,
                mentions: [remitente, victimJid],
            },
            { quoted: m }
        );
    }

    // Verificar las fichas en mano de la víctima (solo se roba dinero en mano, no del banco/caja fuerte)
    if (victimData.dinero < amount) {
        return sock.sendMessage(
            jid,
            {
                text: `◇ 𝗖𝖱𝖴𝖯𝗜𝗘𝗥 ◇\n"La victima no tiene suficientes fichas en mano para tu golpe. Solo tiene ${victimData.dinero} fichas en sus bolsillos."`,
                mentions: [victimJid],
            },
            { quoted: m }
        );
    }

    // --- Robbery Probability Calculation ---
    let probabilidadExito = 0.5; // Base 50% chance of success

    // Attacker's active states affecting success chance
    attackerData.estados ??= {}; // Asegurarse de que 'estados' exista

    if (attackerData.estados.suerte && attackerData.estados.suerte > ahora) {
        probabilidadExito += 0.15; // +15% chance from 'suerte' (Amuleto de la Suerte)
    }
    if (attackerData.estados.fuerzaExtra && attackerData.estados.fuerzaExtra > ahora) {
        probabilidadExito += 0.1; // +10% chance from 'fuerzaExtra' (Carta Marcada)
    }

    const exito = Math.random() < probabilidadExito;

    if (!exito) {
        // --- Robo Fallido ---
        let perdida = Math.floor(amount * 0.3); // Pierde 30% de la cantidad intentada

        // Attacker's active states affecting loss
        if (attackerData.estados.energiaBoost && attackerData.estados.energiaBoost > ahora) { // Si 'energiaBoost' (As bajo la Manga) reduce la penalización
            perdida = Math.floor(perdida / 2); // Reduce la pérdida a la mitad
        }

        attackerData.dinero = Math.max(attackerData.dinero - perdida, 0); // Asegura que el dinero no sea negativo

        // Establecer cooldown
        cooldownsRobar.set(remitente, ahora);
        guardarEconomia();

        return sock.sendMessage(
            jid,
            {
                text: `◇ 𝗖𝖱𝖴𝖯𝗜𝗘𝗥 ◇\n❌ ¡Fallo en el intento!\n@${remitente.split('@')[0]} fue descubierto y ha perdido ${perdida} fichas en la huida.`,
                mentions: [remitente],
            },
            { quoted: m }
        );
    }

    // --- Robo Exitoso ---
    let ganancia = amount;
    // let mensajeExtra = ''; // Removed as per new aesthetic

    if (attackerData.estados.fuerzaExtra && attackerData.estados.fuerzaExtra > ahora) {
        ganancia *= 2; // Duplicar la cantidad robada
        // Consumir el efecto de fuerzaExtra si es de un solo uso
        delete attackerData.estados.fuerzaExtra; // Asumiendo que Carta Marcada se consume al robar exitosamente
        // mensajeExtra = '--- Tu Carta Marcada duplico la ganancia. ---'; // Removed as per new aesthetic
    }

    victimData.dinero -= amount; // La víctima pierde la cantidad original
    attackerData.dinero += ganancia; // El atacante gana la cantidad (potencialmente duplicada)

    // Establecer cooldown
    cooldownsRobar.set(remitente, ahora);
    guardarEconomia();

    return sock.sendMessage(
        jid,
        {
            text: `◇ 𝗖𝖱𝖴𝖯𝗜𝗘𝗥 ◇\n✅ ¡Robo Exitoso!\n@${remitente.split('@')[0]} ha conseguido robar ${ganancia} fichas de @${victimJid.split('@')[0]}.`,
            mentions: [remitente, victimJid],
        },
        { quoted: m }
    );
};

export const config = {
    name: 'robar',
    alias: ['steal', 'atraco'],
    description: 'Permite a los usuarios intentar robar fichas a otros jugadores en el casino, con probabilidad de exito y penalizaciones.',
    usage: '$robar @usuario <cantidad>',
    necesitaMetadata: true, // Necesita metadata del grupo para las menciones.
};