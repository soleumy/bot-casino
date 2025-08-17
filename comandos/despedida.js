// comandos/despedida.js

const imagenDespedida = 'https://i.pinimg.com/736x/3e/52/f8/3e52f8909db0e94e1663918fb28ac903.jpg'; // Retaining the original image for now, as it's not strictly "Hyacine" themed.

const defaultTextoDespedida = `🎰 *¡Se apagan las luces para un jugador!* 🎰

🎲 "El crupier anuncia que un participante ha decidido retirarse de la mesa de juego."

¡Hasta la próxima, *@usuario*!
El Casino lamenta tu partida, pero la emoción y las apuestas que compartiste quedarán grabadas en los libros de la casa.

> ✨ *Que tus futuras tiradas estén llenas de suerte y grandes ganancias.*
> 🌟 *Recuerda que las puertas de este casino siempre estarán abiertas para tu regreso, ¡la fortuna te espera!*

— *Con el deseo de un golpe de suerte en tu próximo juego.* 🃏
`;

export default async function despedidaHandler(sock, m, args, extra) {
    const {
        jid,
        remitente,
        isGroup,
        chatConfig,
        guardarEconomia
    } = extra;

    const subcmd = args[0]?.toLowerCase();
    const textoCompleto = m.message.conversation || m.message.extendedTextMessage?.text || '';

    const nuevoMensaje = textoCompleto.toLowerCase().startsWith('$despedida cambiar')
                             ? textoCompleto.substring('$despedida cambiar'.length).trim()
                             : '';

    if (!chatConfig.despedida) {
        chatConfig.despedida = {
            activa: false,
            mensaje: defaultTextoDespedida
        };
        guardarEconomia();
    }

    if (!isGroup) {
        return sock.sendMessage(jid, { text: 'Este comando solo tiene sentido en el gran salón del casino, ¡no en partidas privadas!' }, { quoted: m });
    }

    let esAdmin = false;
    try {
        const metadata = await sock.groupMetadata(jid);
        const participants = metadata.participants;
        esAdmin = participants.some(p => p.id === remitente && (p.admin === 'admin' || p.admin === 'superadmin'));
    } catch (error) {
        console.error("Error al obtener metadatos del grupo para despedida:", error);
        return sock.sendMessage(jid, { text: "❌ No pude verificar tus permisos de administrador. Parece que la conexión con la sala de control se perdió. Intenta de nuevo." }, { quoted: m });
    }

    if (!esAdmin) {
        return sock.sendMessage(jid, {
            text: '🚫 *Lo siento, crupier...* Solo los *Gerentes del Casino* (administradores) pueden ajustar las reglas de bienvenida y despedida. Tus apuestas son valiosas, pero la gestión es solo para ellos.'
        }, { quoted: m });
    }

    if (!subcmd) {
        return sock.sendMessage(jid, {
            text: `✨ *Para configurar los mensajes de despedida de este casino, puedes elegir:*\n\n` +
                  `\`$despedida activar\` - Encender las luces de despedida.\n` +
                  `\`$despedida desactivar\` - Apagar los anuncios de salida.\n` +
                  `\`$despedida cambiar <mensaje>\` - Diseña un nuevo mensaje para los que se retiran.\n` +
                  `\`$despedida ver\` - Para revisar el mensaje actual.\n\n` +
                  `*Recuerda que puedes usar la siguiente variable:*\n` +
                  `\`@usuario\` → se transformará en una mención del jugador que se despide.`
        }, { quoted: m });
    }

    switch (subcmd) {
        case 'activar':
            chatConfig.despedida.activa = true;
            guardarEconomia();
            return sock.sendMessage(jid, { text: '✅ *¡Los anuncios de despedida han sido activados!* Ahora, cada jugador que se retire será despedido con un mensaje.' }, { quoted: m });

        case 'desactivar':
            chatConfig.despedida.activa = false;
            guardarEconomia();
            return sock.sendMessage(jid, { text: '✅ *Los anuncios de despedida han sido desactivados.* Los jugadores ahora se retirarán sin un mensaje inmediato.' }, { quoted: m });

        case 'cambiar':
            if (!nuevoMensaje) {
                return sock.sendMessage(jid, {
                    text: '❌ *Oh, crupier...* Para diseñar un nuevo mensaje de despedida, necesito las palabras que quieres usar. Ejemplo:\n`$despedida cambiar ¡Adiós, @usuario! Vuelve pronto a la mesa.`'
                }, { quoted: m });
            }
            chatConfig.despedida.mensaje = nuevoMensaje;
            guardarEconomia();
            return sock.sendMessage(jid, { text: '✅ *¡El mensaje de despedida ha sido reescrito y actualizado!* Que resuene con cada partida.' }, { quoted: m });

        case 'ver':
            return sock.sendMessage(jid, {
                text: `📩 *¡Mira el mensaje de despedida actual de este casino:*\n\n${chatConfig.despedida.mensaje}`
            }, { quoted: m });

        default:
            return sock.sendMessage(jid, { text: '❌ *Hmm, parece que esa no es una jugada que reconozca.* Por favor, consulta las opciones para encontrar el comando correcto.' }, { quoted: m });
    }
}

export async function manejarGrupoUpdateDespedida({ sock, update, db, botJid }) {
    if (!update || !update.participants || !update.id || update.action !== 'remove') return; // Solo actua en 'remove'

    const jid = update.id;
    const participantesQueSalen = update.participants;

    const chatConfig = db[jid]?.config;

    // Si no hay configuración de despedida o no está activa, o no hay mensaje, no hacer nada
    if (!chatConfig || !chatConfig.despedida?.activa || !chatConfig.despedida.mensaje) {
        // Asegurarse de inicializar si no existe (aunque esto podría manejarse en la carga inicial)
        db[jid] ??= { users: {}, config: {} };
        db[jid].config ??= {};
        db[jid].config.despedida ??= {
            activa: false,
            mensaje: defaultTextoDespedida
        };
        return;
    }

    for (const userJid of participantesQueSalen) {
        if (userJid === botJid) {
            continue; // No enviar mensaje si el bot es quien se va
        }

        const numero = userJid.split('@')[0];
        const mentionTag = `@${numero}`;
        const mensajeFinal = chatConfig.despedida.mensaje.replace(/@usuario/g, mentionTag);

        try {
            await sock.sendMessage(jid, {
                image: { url: imagenDespedida },
                caption: mensajeFinal,
                mentions: [userJid]
            });
        } catch (error) {
            console.error(`❌ Error al enviar mensaje de despedida a ${userJid} en ${jid}:`, error);
        }
    }
}

export { imagenDespedida };

export const config = {
    name: 'despedida',
    alias: ['adios', 'chau', 'partida'], // Mantenemos los alias, son bastante neutrales.
    description: 'Permite a los administradores del grupo configurar y gestionar el mensaje de despedida automática para los usuarios que abandonan el chat.',
    usage: '$despedida [activar|desactivar|cambiar <mensaje>|ver]',
    necesitaMetadata: true,
};