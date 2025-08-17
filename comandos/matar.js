// comandos/matar.js

const cooldownsMatar = new Map(); // Cooldown para el comando $matar

export default async (sock, m, args, { jid, remitente, user, db, guardarEconomia }) => {
    const menciones = m.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    const objetivo = menciones.length > 0 ? menciones[0] : null;

    const ahora = Date.now();
    const cooldownTiempo = 10 * 60 * 1000; // 10 minutos de cooldown para el comando $matar

    // --- Cooldown Check para el remitente ---
    const ultimoUso = cooldownsMatar.get(remitente) || 0;
    if (ahora - ultimoUso < cooldownTiempo) {
        const segundosRestantes = Math.ceil((cooldownTiempo - (ahora - ultimoUso)) / 1000);
        const minutosRestantes = Math.ceil(segundosRestantes / 60);
        return sock.sendMessage(
            jid,
            { text: `⏳ *Hyacine susurra:*\n"El éter aún resuena con tu última interacción. Permite que la energía se reequilibre. Podrás intervenir de nuevo en *${minutosRestantes} minuto(s)*."` },
            { quoted: m }
        );
    }

    // --- URL de la imagen temática de Hyacinth (ajusta si tienes una mejor) ---
    // Esta imagen genérica representa un ambiente etéreo/místico.
    const externalImageUrl = 'https://i.pinimg.com/736x/30/e0/e3/30e0e3efb8fcd9e1d4ba1d1309f5a009.jpg'; // Imagen de "Luz etérea / Santuario"

    // Si no se menciona a nadie o se menciona a sí mismo
    if (!objetivo || objetivo === remitente) {
        // Prevenir el ataque al bot si se le menciona
        const botId = sock.user?.id?.split(':')[0] + '@s.whatsapp.net';
        if (objetivo === botId) {
            return sock.sendMessage(jid, { text: '🚫 *Hyacine sonríe:*\n"Mi esencia es la luz misma del santuario. No puedes disolver lo que es eterno e intangible."' }, { quoted: m });
        }

        // Confirmación para "auto-trascendencia"
        if (args[0]?.toLowerCase() !== 'confirmar') {
            return sock.sendMessage(
                jid,
                { text: `💔 *Hyacine percibe tu alma:*\n"Oh, alma valiente, ¿deseas que tu energía se disipe por un momento? Si tu corazón lo dicta, pronuncia *$matar confirmar* para fusionarte con el ciclo lumínico."` },
                { quoted: m }
            );
        }

        // Simula la "auto-trascendencia"
        let mensajeSuicidio = `🌌 @${remitente.split('@')[0]}, guiado por el susurro de la luz, ha decidido trascender el plano terrenal por un instante, entregándose a la melodía final de su forma actual. Que su esencia se renueve en el Twilight Courtyard.`;
        let perdidaGemas = Math.floor(user.dinero * 0.25); // Pierde el 25% de sus Gemas (antes Moras)

        user.dinero = Math.max(0, user.dinero - perdidaGemas);
        guardarEconomia();
        cooldownsMatar.set(remitente, ahora); // Establecer cooldown incluso para auto-trascendencia

        return sock.sendMessage(
            jid,
            {
                image: { url: externalImageUrl },
                caption: `${mensajeSuicidio}\n\n_💎 Has ofrecido *${perdidaGemas} Gemas* a los ciclos de la luz en este viaje._`,
                mentions: [remitente],
            },
            { quoted: m }
        );

    } else { // Si se menciona a otro usuario
        const victimData = db[jid]?.users?.[objetivo]; // Acceso a los datos de la víctima

        if (!victimData) {
            return sock.sendMessage(
                jid,
                { text: `❌ *Hyacine no encuentra el eco:*\n"El alma de *@${objetivo.split('@')[0]}* no ha tejido un sendero perceptible en este reino etéreo. No puedes disipar a quien no resuena aquí."` },
                { mentions: [objetivo], quoted: m }
            );
        }

        // No permitir atacar al bot
        const botId = sock.user?.id?.split(':')[0] + '@s.whatsapp.net';
        if (objetivo === botId) {
            return sock.sendMessage(jid, { text: '🚫 *Hyacine sonríe:*\n"Mi esencia es la luz misma del santuario. No puedes disolver lo que es eterno e intangible."' }, { quoted: m });
        }

        // --- Lógica de Intervención de Energía (Simplificada) ---
        let probabilidadExito = 0.5; // Probabilidad base de éxito para el atacante

        user.estados ??= {}; // Asegura que el objeto 'estados' exista
        victimData.estados ??= {}; // Asegura que el objeto 'estados' exista

        // Modificadores de probabilidad basados en estados
        if (user.estados.fuerzaExtra && user.estados.fuerzaExtra > ahora) {
            probabilidadExito += 0.2; // 20% más de probabilidad de éxito para el atacante
        }
        if (victimData.estados.escudoDivino && victimData.estados.escudoDivino > ahora) {
            probabilidadExito -= 0.3; // 30% menos de probabilidad de éxito para el atacante
        }

        const exitoIntervencion = Math.random() < probabilidadExito;

        // --- Protecciones de la víctima (ej: Amuleto de Resurrección) ---
        if (victimData.estados.amuletoResurreccion && victimData.estados.amuletoResurreccion > ahora) {
            delete victimData.estados.amuletoResurreccion; // Consume el amuleto
            guardarEconomia();
            cooldownsMatar.set(remitente, ahora); // Aplicar cooldown al atacante

            return sock.sendMessage(
                jid,
                {
                    image: { url: externalImageUrl },
                    caption: `✨ *El Santuario de la Luz protege:*\n"El intento de @${remitente.split('@')[0]} de alterar la energía de *@${objetivo.split('@')[0]}* fue desviado por la sagrada intercesión de un *Amuleto de Resurrección*.\n¡La armonía lumínica prevalece sobre el desequilibrio!"`,
                    mentions: [remitente, objetivo],
                },
                { quoted: m }
            );
        }

        if (exitoIntervencion) {
            let mensajeExito = `💫 *¡El eco del encuentro ha tomado forma!*✨\n"Con una intervención certera que resonó en el éter, @${remitente.split('@')[0]} ha logrado disipar la energía de @${objetivo.split('@')[0]}, reequilibrando el flujo. Hyacine asiente ante el dominio del aura."`;
            let botinGemas = Math.floor(victimData.dinero * (Math.random() * 0.2 + 0.1)); // Gana entre 10% y 30% de las Gemas de la víctima

            victimData.dinero = Math.max(0, victimData.dinero - botinGemas); // La víctima pierde Gemas
            user.dinero += botinGemas; // El atacante gana Gemas

            guardarEconomia();
            cooldownsMatar.set(remitente, ahora); // Aplicar cooldown al atacante

            return sock.sendMessage(
                jid,
                {
                    image: { url: externalImageUrl },
                    caption: `${mensajeExito}\n\n_💎 *Ecos de abundancia:* *${botinGemas} Gemas* fluyeron hacia el victorioso._`,
                    mentions: [remitente, objetivo],
                },
                { quoted: m }
            );
        } else {
            let mensajeFracaso = `✨ *La luz no lo permitió:*\n"El intento de @${remitente.split('@')[0]} de alterar la energía de *@${objetivo.split('@')[0]}* se disipó en el éter. La armonía del santuario no bendijo su intento, y el eco del encuentro se desvaneció."`;
            let perdidaAtacante = Math.floor(user.dinero * 0.1); // El atacante pierde 10% de sus Gemas por el fracaso

            user.dinero = Math.max(0, user.dinero - perdidaAtacante); // El atacante pierde Gemas

            guardarEconomia();
            cooldownsMatar.set(remitente, ahora); // Aplicar cooldown al atacante

            return sock.sendMessage(
                jid,
                {
                    image: { url: externalImageUrl },
                    caption: `${mensajeFracaso}\n\n_💎 En la retirada etérea, *${perdidaAtacante} Gemas* se disolvieron en el aire._`,
                    mentions: [remitente, objetivo],
                },
                { quoted: m }
            );
        }
    }
};

export const config = {
    name: 'matar',
    alias: ['duelo', 'intervenir', 'disipar'],
    description: 'Permite a Hyacine presenciar una "intervención de energía" entre usuarios, con posibles ganancias o pérdidas de Gemas.',
    usage: '$matar [@mención | confirmar]',
    cooldown: 600, // 10 minutos en segundos (600 segundos)
    necesitaMetadata: false, // No necesita metadata de grupo.
};