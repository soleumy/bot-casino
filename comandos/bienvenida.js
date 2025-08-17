// comandos/bienvenida.js

// Imagen de bienvenida con temática de casino (cambiada para que se ajuste mejor)
const imagenBienvenida = 'https://i.pinimg.com/736x/3e/52/f8/3e52f8909db0e94e1663918fb28ac903.jpg'; // Nueva imagen con temática de casino/bienvenida


const defaultTextoBienvenida = `🎰 *¡Una nueva ficha se une a nuestra mesa!* 🃏

✨ "Se ha unido un nuevo apostador a nuestra sala VIP. ¡Prepárense para una nueva ronda de emociones!"

¡Bienvenido!
Soy tu Crupier de Bienvenida, y mi propósito es asegurar que tu experiencia en este casino sea emocionante y justa. Aquí, la fortuna está al alcance de tu mano y cada jugada cuenta.

> 🎲 *¿Necesitas una mano? Consulta las reglas del juego con $help.*
> 💰 *Haz tus apuestas y que la suerte te acompañe en cada jugada.*

— *Que tu presencia eleve las ganancias de la mesa, y que cada carta que recibas te acerque al jackpot.* 🃏`;


export default async function bienvenidaHandler(sock, m, args, extra) {
    const {
        jid,
        remitente,
        isGroup,
        chatConfig,
        guardarEconomia
    } = extra;

    const textRaw = m.message.conversation || m.message.extendedTextMessage?.text || '';
    const subcmd = args[0]?.toLowerCase();

    const nuevoMensaje = textRaw.toLowerCase().startsWith('$bienvenida cambiar')
                               ? textRaw.substring('$bienvenida cambiar'.length).trim()
                               : '';

    // Inicializa la configuración de bienvenida si no existe.
    if (!chatConfig.bienvenida) {
        chatConfig.bienvenida = {
            activa: false,
            mensaje: defaultTextoBienvenida
        };
        guardarEconomia();
    }

    if (!isGroup) {
        return sock.sendMessage(jid, { text: '✕ Este comando solo puede ser usado en nuestras mesas de juego (grupos).' }, { quoted: m });
    }

    // Verifica si el remitente es un administrador del grupo (un "Gerente de Casino").
    let esAdmin = false;
    try {
        const metadata = await sock.groupMetadata(jid);
        const participants = metadata.participants;
        esAdmin = participants.some(p => p.id === remitente && (p.admin === 'admin' || p.admin === 'superadmin'));
    } catch (error) {
        console.error("Error al obtener metadatos del grupo para el comando bienvenida:", error);
        return sock.sendMessage(jid, { text: "✕ *Las luces del casino parpadearon...* No pude verificar tus permisos de Gerente. Por favor, intenta de nuevo." }, { quoted: m });
    }

    if (!esAdmin) {
        return sock.sendMessage(jid, {
            text: '🚫 *Lo siento, apostador...* Solo los *Gerentes de Casino* (administradores) tienen la autoridad para configurar la bienvenida en esta sala. Consulta con uno de ellos para ajustar las reglas de la casa.'
        }, { quoted: m });
    }

    // Si no se proporciona un subcomando, muestra las opciones disponibles.
    if (!subcmd) {
        return sock.sendMessage(jid, {
            text: `🎰 *Para configurar la bienvenida de nuestra sala de casino, puedes usar estas opciones:*\n\n` +
                  `\`$bienvenida activar\` - Abrir las puertas para dar la bienvenida oficial a cada nuevo jugador.\n` +
                  `\`$bienvenida desactivar\` - Cerrar las bienvenidas automáticas; los nuevos jugadores entrarán sin presentación.\n` +
                  `\`$bienvenida cambiar <mensaje>\` - Diseña un nuevo cartel de bienvenida para los recién llegados a la mesa.\n` +
                  `\`$bienvenida ver\` - Para revisar el mensaje de bienvenida actual de la sala VIP.\n\n` +
                  `*Puedes usar estas fichas especiales en tu mensaje:*\n` +
                  `\`@usuario\` → se transformará en una mención directa al nuevo jugador.`
        }, { quoted: m });
    }

    // Lógica para cada subcomando.
    switch (subcmd) {
        case 'activar':
            chatConfig.bienvenida.activa = true;
            guardarEconomia();
            return sock.sendMessage(jid, { text: ' ✓  *¡Las puertas del casino se han abierto!* Ahora, cada nuevo jugador recibirá una bienvenida oficial a la mesa.' }, { quoted: m });

        case 'desactivar':
            chatConfig.bienvenida.activa = false;
            guardarEconomia();
            return sock.sendMessage(jid, { text: ' ✓  *Las bienvenidas automáticas están en pausa.* Los nuevos jugadores ahora entrarán sin un saludo especial.' }, { quoted: m });

        case 'cambiar':
            if (!nuevoMensaje) {
                return sock.sendMessage(jid, {
                    text: '✕ *Oh, la apuesta fue vacía...* Necesito un mensaje para cambiar la bienvenida. Ejemplo:\n`$bienvenida cambiar ¡Bienvenido, @usuario! Que tu suerte cambie en este casino.`'
                }, { quoted: m });
            }
            chatConfig.bienvenida.mensaje = nuevoMensaje;
            guardarEconomia();
            return sock.sendMessage(jid, { text: '✓  *¡El cartel de bienvenida ha sido actualizado!* Preparado para recibir a los nuevos jugadores con tu mensaje.' }, { quoted: m });

        case 'ver':
            return sock.sendMessage(jid, {
                text: `📩 *Este es el mensaje de bienvenida actual de la sala de casino:*\n\n${chatConfig.bienvenida.mensaje}`
            }, { quoted: m });

        default:
            return sock.sendMessage(jid, { text: '✕ *Esa jugada no está en el reglamento.* Por favor, consulta las opciones válidas para el comando `$bienvenida`.' }, { quoted: m });
    }
}

// Función para manejar las actualizaciones del grupo (nuevos miembros).
export async function manejarGrupoUpdate({ sock, update, db, botJid }) {
    if (!update || !update.participants || !update.id) return;

    const jid = update.id;
    const participantes = update.participants;

    const chatConfig = db[jid]?.config;

    // Si la configuración no existe o la bienvenida no está activa, o no hay mensaje personalizado,
    // asegúrate de inicializar la configuración a los valores por defecto y salir.
    if (!chatConfig || !chatConfig.bienvenida?.activa || !chatConfig.bienvenida.mensaje) {
        db[jid] ??= { users: {}, config: {} };
        db[jid].config ??= {};
        db[jid].config.bienvenida ??= {
            activa: false,
            mensaje: defaultTextoBienvenida
        };
        return;
    }

    for (const userJid of participantes) {
        // No enviamos mensaje de bienvenida al propio bot si se añade.
        if (userJid === botJid) {
            continue;
        }

        const numero = userJid.split('@')[0];
        const mentionTag = `@${numero}`;
        const mensajeFinal = chatConfig.bienvenida.mensaje.replace(/@usuario/g, mentionTag);

        try {
            await sock.sendMessage(jid, {
                image: { url: imagenBienvenida },
                caption: mensajeFinal,
                mentions: [userJid]
            });
        } catch (error) {
            console.error(`✕ Error al enviar mensaje de bienvenida a ${userJid} en ${jid}:`, error);
        }
    }
}

// Exporta la URL de la imagen para que pueda ser utilizada en otros lugares si es necesario.
export { imagenBienvenida };

// Configuración del comando para el sistema principal del bot.
export const config = {
    name: 'bienvenida',
    alias: ['welcome', 'saludar'],
    description: 'Configura y gestiona el mensaje de bienvenida para los nuevos miembros del grupo, con temática de casino. Solo para administradores.',
    usage: '$bienvenida [activar|desactivar|cambiar <mensaje>|ver]',
    necesitaMetadata: true,
};