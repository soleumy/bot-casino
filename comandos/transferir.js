// comandos/transferir.js

export default async (sock, m, args, extra) => {
    // Desestructuramos lo necesario del objeto 'extra'
    // 'user' es el objeto del remitente, 'jid' es el JID del chat
    const { jid, remitente, user, obtenerDatosDelChat, guardarEconomia, isGroup } = extra;

    const mentions = m.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];

    let amount;
    let receiverJid;

    // Lógica para determinar el receptor y la cantidad
    // Si hay una mención, el receptor es el mencionado y la cantidad es el segundo argumento
    if (mentions.length > 0) {
        receiverJid = mentions[0];
        amount = parseInt(args[1]);
    } else {
        // Si no hay mención, se asume que el primer argumento es la cantidad y el comando está mal usado
        amount = parseInt(args[0]); // Se parsea solo para que isNaN lo detecte
        receiverJid = null; // Reiniciamos receiverJid para que falle la validación inicial
    }

    // --- Input Validation ---
    // Si no hay un receptor válido O la cantidad no es un número O la cantidad es menor o igual a 0
    if (!receiverJid || isNaN(amount) || amount <= 0) {
        return sock.sendMessage(
            jid,
            {
                text: `◇ 𝗖𝖱𝖴𝖯𝗜𝗘𝗥 ◇\n"Para mover fichas entre jugadores, debes indicar al destinatario y la cantidad exacta."\n\n♦️ *$transferir @jugador <cantidad>*\n\n_Ejemplo:_\n🎲 $transferir @suertudo 1500` // Mensaje tematizado
            },
            { quoted: m }
        );
    }

    // Prevenir auto-transferencia
    if (receiverJid === remitente) {
        return sock.sendMessage(
            jid,
            {
                text: `◇ 𝗖𝖱𝖴𝖯𝗜𝗘𝗥 ◇\n"Las fichas no cambian de mano si solo las mueves en tu propio bolsillo. ¡Busca a otro con quien apostar!"` // Mensaje tematizado
            },
            { quoted: m }
        );
    }

    // Prevenir transferencia al bot
    const botId = sock.user?.id?.split(':')[0] + '@s.whatsapp.net';
    if (receiverJid === botId) {
        return sock.sendMessage(jid, { text: '◇ 𝗖𝖱𝖴𝖯𝗜𝗘𝗥 ◇\n"¡La Casa no acepta propinas forzadas! Mis arcas son infinitas. Quédate tus fichas para el juego."' }, { quoted: m });
    }

    // --- Obtener datos del remitente y del receptor usando obtenerDatosDelChat ---
    const userSender = user; // 'user' en 'extra' ya es el objeto de datos del remitente
    const userReceiver = obtenerDatosDelChat(jid, receiverJid, isGroup); // Obtener datos del receptor

    if (!userReceiver) {
        return sock.sendMessage(
            jid,
            { text: `◇ 𝗖𝖱𝖴𝖯𝗜𝗘𝗥 ◇\n"El jugador *@${receiverJid.split('@')[0]}* no está registrado en los libros del Casino. Solo puedes transferir fichas a jugadores activos."` }, // Mensaje tematizado
            { mentions: [receiverJid], quoted: m }
        );
    }

    // --- Comprobar Saldo del Remitente ---
    if (userSender.dinero < amount) {
        return sock.sendMessage(
            jid,
            {
                text: `◇ 𝗖𝖱𝖴𝖯𝗜𝗘𝗥 ◇\n"No tienes suficientes fichas en mano para esta transacción."\n\n💼 Fichas en tu bolsillo: *${userSender.dinero} Dinero*` // Mensaje y moneda tematizados
            },
            { quoted: m }
        );
    }

    // --- Realizar la Transferencia ---
    userSender.dinero -= amount;
    userReceiver.dinero += amount;

    // --- Marcar para Guardar ---
    guardarEconomia();

    // --- Mensaje de Confirmación ---
    return sock.sendMessage(
        jid,
        {
            text: `◇ 𝗖𝖱𝖴𝖯𝗜𝗘𝗥 ◇\n🤝 *¡Transacción de fichas completada!*\n\n@${remitente.split('@')[0]} ha transferido *${amount} Dinero* a @${receiverJid.split('@')[0]}.`, // Mensaje y moneda tematizados
            mentions: [remitente, receiverJid]
        },
        { quoted: m }
    );
};