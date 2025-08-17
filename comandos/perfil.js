// comandos/perfil.js

function generarBarra(porcentaje, largo = 10, emoji = '⛀') {
    const llenos = Math.round(porcentaje * largo);
    const vacíos = largo - llenos;
    return emoji.repeat(llenos) + ''.repeat(vacíos);
}

export default async (sock, m, args, { jid, remitente, user, db, guardarEconomia, obtenerDatosDelChat, isGroup, matrimonies }) => {
    const mentionedJids = m.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    let targetJid;
    let targetUser;

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
        targetUser = user;
    }

    // Asegurarse de que las propiedades existan en targetUser
    targetUser.dinero ??= 0;
    targetUser.banco ??= 0;
    targetUser.inventario ??= [];
    targetUser.energia ??= 100;
    targetUser.fuerza ??= 0;
    targetUser.estados ??= {};
    targetUser.titulos ??= [];
    targetUser.propiedades ??= [];
    targetUser.mensajes ??= 0;
    targetUser.experiencia ??= 0;
    targetUser.nivel ??= 1;

    const {
        dinero, banco, inventario, propiedades, titulos, estados, energia, experiencia, nivel, fuerza
    } = targetUser;

    const expSiguiente = nivel * 100;
    const progresoExp = Math.min(experiencia / expSiguiente, 1);
    const barraExp = generarBarra(progresoExp, 10, '⛀'); // Emoji neutral

    const progresoEnergia = Math.min(energia / 100, 1);
    const barraEnergia = generarBarra(progresoEnergia, 10, '🂱'); // Emoji neutral

    const efectosActivos = [];
    const ahora = Date.now();

    // Nombres neutrales para los estados
    if (estados.invisible && ahora < estados.invisible) efectosActivos.push(' Invisible');
    if (estados.trabajoVIP && ahora < estados.trabajoVIP) efectosActivos.push(' VIP Trabajo');
    if (estados.bonusTrabajo && ahora < estados.bonusTrabajo) efectosActivos.push(' Bonus Trabajo');
    if (estados.suerte && ahora < estados.suerte) efectosActivos.push(' Suerte');
    if (estados.fuerzaExtra && ahora < estados.fuerzaExtra) efectosActivos.push(' Fuerza Extra');
    if (estados.proteccionRobo && ahora < estados.proteccionRobo) efectosActivos.push(' Protección Robo');
    if (estados.interesBanco && ahora < estados.interesBanco) efectosActivos.push(' Interés Banco');

    // --- Lógica ACTUALIZADA para encontrar la pareja, usando la estructura por grupo ---
    let parejaId = null;

    // Solo buscar pareja si el chat es un grupo y hay datos de matrimonio para ese grupo
    if (isGroup && matrimonies?.[jid]) {
        const groupMarriages = matrimonies[jid]; // Accede a los matrimonios específicos de este grupo

        // Busca si targetJid es una clave (marido 1) o un valor (marido 2) en los matrimonios del grupo
        for (const [id1, id2] of Object.entries(groupMarriages)) {
            if (id1 === targetJid) {
                parejaId = id2;
                break; // Pareja encontrada como valor
            }
            if (id2 === targetJid) {
                parejaId = id1;
                break; // Pareja encontrada como clave
            }
        }
    }

    const parejaTexto = parejaId
        ? ` Pareja: @${parejaId.split('@')[0]}`
        : ' Sin pareja';

    const nombreUsuario = `@${targetJid.split('@')[0]}`;

    const mensajePerfil = `
ㅤ     ㅤ
    ⛁  ۫  ִ       ⎯    𝗣𝗘𝗥𝗙𝗜𝗟 𝗗𝗘
                             𝗨𝗦𝗨𝗔𝗥𝗜𝗢 〗  🎰

                         ❚ ㅤ𓈒𓈒𓈒  ${nombreUsuario}


          ════════════════


➜ ㅤ ㅤ ﹟     𝐍ivel; ${nivel}
➜ ㅤ ㅤ ﹟     𝐅uerza, ${fuerza}
➜ ㅤ ㅤ ﹟     𝐄xperiencia, ${experiencia} / ${expSiguiente}
⏝ ͝    𑄹   𝅄ㅤ  ${barraExp}
 ➜ ㅤ ㅤ ﹟     𝐄nergía;  ${energia} / 100
 ⏝ ͝    𑄹   𝅄ㅤ ${barraEnergia}

 ⃞ ⎯ㅤ㧣 • 𝗕𝗘𝗟𝗢𝗡𝗚𝗜𝗡𝗚𝗦 𝄒꯭᎗ 


➜ ㅤ ㅤ ﹟     𝐃inero en mano; ${dinero}
➜ ㅤ ㅤ ﹟     𝐃inero en banco; ${banco}
➜ ㅤ ㅤ ﹟     𝐈nventario, ${inventario.length ? inventario.join(', ') : 'Vacío'}
➜ ㅤ ㅤ ﹟     𝐏ropiedades, ${propiedades.length ? propiedades.join(', ') : 'Ninguna'}
➜ ㅤ ㅤ ﹟     𝐓ítulos; ${titulos.length ? titulos.join(', ') : 'Ninguno'}
➜ ㅤ ㅤ ﹟     𝐄stados activos;  ${efectosActivos.length ? efectosActivos.join(', ') : 'Ninguno'}
 ➜ ㅤ ㅤ ﹟     ${parejaTexto}

                       ──────────
`;

    const fixedImageUrl = 'https://i.pinimg.com/736x/7e/32/7e/7e327e6dfa9317132678043284eda767.jpg';

    const mentions = [targetJid];
    if (parejaId) {
        mentions.push(parejaId);
    }

    await sock.sendMessage(jid, {
        image: { url: fixedImageUrl },
        caption: mensajePerfil.trim(),
        mentions: mentions
    }, { quoted: m });
};

export const config = {
    name: 'perfil',
    alias: ['profileee', 'userinfo'],
    description: 'Muestra la información del perfil de un usuario.',
    usage: '$perfil [@mención]',
    cooldown: 5,
    necesitaMetadata: false, // No necesita metadata del grupo para el check de admin
};