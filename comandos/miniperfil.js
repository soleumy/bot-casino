// comandos/profile.js (o miniperfil.js)

// Función auxiliar para generar barras (copiada del perfil.js para independencia)
function generarBarra(porcentaje, largo = 10, emoji = '⛀') {
    const llenos = Math.round(porcentaje * largo);
    const vacíos = largo - llenos;
    return emoji.repeat(llenos) + ' '.repeat(vacíos); // Cambiado '' a ' ' para el espacio vacío
}

export default async (sock, m, args, { jid, remitente, user, obtenerDatosDelChat, isGroup }) => {
    const mentionedJids = m.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    let targetJid;
    let targetUser;

    // Determinar si el comando es para el propio usuario o para un mencionado
    if (mentionedJids.length > 0) {
        targetJid = mentionedJids[0];
        targetUser = obtenerDatosDelChat(jid, targetJid, isGroup);

        if (!targetUser) {
            return sock.sendMessage(
                jid,
                { text: `❌ *Error:*\n"El usuario *@${targetJid.split('@')[0]}* no tiene un perfil registrado en la base de datos."` },
                { mentions: [targetJid], quoted: m }
            );
        }
    } else {
        targetJid = remitente;
        targetUser = user; // 'user' ya contiene los datos del remitente
    }

    // Asegurarse de que las propiedades clave existan en targetUser
    targetUser.dinero ??= 0;
    targetUser.banco ??= 0; // Añadido
    targetUser.fuerza ??= 0; // Añadido
    targetUser.energia ??= 100;
    targetUser.experiencia ??= 0;
    targetUser.nivel ??= 1;

    // Desestructuración para incluir banco y fuerza
    const { dinero, banco, fuerza, energia, experiencia, nivel } = targetUser;

    // Calcular progreso de experiencia y energía
    const expSiguiente = nivel * 100; // Ejemplo: 100 exp para Nivel 2, 200 para Nivel 3, etc.
    const progresoExp = Math.min(experiencia / expSiguiente, 1);
    const barraExp = generarBarra(progresoExp, 8, '⛀'); // Barra de 8 caracteres con emoji azul

    const progresoEnergia = Math.min(energia / 100, 1);
    const barraEnergia = generarBarra(progresoEnergia, 8, '🂱'); // Barra de 8 caracteres con emoji verde

    const nombreUsuario = `@${targetJid.split('@')[0]}`;

    // Estructura del mensaje modificada para incluir banco y fuerza
    const mensajeMiniPerfil = `
ㅤ     ㅤ
ㅤ  ㅤ     ㅤ
    ⛁  ۫  ִ       ⎯    𝗣𝗘𝗥𝗙𝗜𝗟 𝗗𝗘
                             𝗨𝗦𝗨𝗔𝗥𝗜𝗢 〗  🎰

                         ❚ ㅤ𓈒𓈒𓈒 ${nombreUsuario} 
                  ════════════════
                  
➜ ㅤ ㅤ ﹟     𝐍ivel; ${nivel}
➜ ㅤ ㅤ ﹟     𝐄xperiencia, ${experiencia} / ${expSiguiente}
 ⏝ ͝    𑄹   𝅄ㅤ  ${barraExp}
 ➜ ㅤ ㅤ ﹟     𝐄nergía;   ${energia} / 100
⏝ ͝    𑄹   𝅄ㅤ  ${barraEnergia}
➜ ㅤ ㅤ ﹟     𝐅uerza;   ${fuerza} 


➜ ㅤ ㅤ ﹟     𝐃inero en mano; ${dinero}
➜ ㅤ ㅤ ﹟     𝐃inero en banco; ${banco} 

                        
                       ──────────`;

    // Las menciones son solo para el usuario cuyo perfil se muestra
    const mentions = [targetJid];

    await sock.sendMessage(jid, {
        text: mensajeMiniPerfil.trim(),
        mentions: mentions
    }, { quoted: m }); // Se mantiene el quoted: m para el contexto del mensaje.
};

export const config = {
    name: 'miniperfil', // El nombre del comando principal será $profile
    alias: ['p', 'miniprofile'], // Alias más cortos o descriptivos
    description: 'Muestra un resumen conciso del perfil de un usuario.',
    usage: '$miniperfil [@mención]',
    cooldown: 3, // Un cooldown más corto para un comando rápido
    necesitaMetadata: false,
};