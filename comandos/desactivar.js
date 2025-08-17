// comandos/desactivar.js

export default async function desactivarHandler(sock, m, args, extra) {
    const { jid, db, isGroup } = extra;

    if (!isGroup) {
        return sock.sendMessage(jid, {
            text: '❌ Este comando solo puede ser usado en grupos.',
        }, { quoted: m });
    }

    // Obtener metadata del grupo
    const metadata = await sock.groupMetadata(jid);
    const participants = metadata.participants;

    // ID del usuario que ejecuta el comando
    const usuario = m.key.participant || m.key.remoteJid;

    // Verificar si es admin o superadmin
    const esAdmin = participants?.some(p => p.id === usuario && (p.admin === 'admin' || p.admin === 'superadmin'));

    if (!esAdmin) {
        return sock.sendMessage(jid, {
            text: `🚫 Solo los administradores de este grupo pueden desactivar el bot.`,
        }, { quoted: m });
    }

    // Inicializar estado del grupo si no existe
    db[jid] ??= {};
    // Desactivar bot en este grupo
    db[jid].activo = false;

    return sock.sendMessage(jid, {
        text: `🃏  El bot ha sido *desactivado* en este grupo.

Para volver a activarlo, un administrador puede usar el comando *$activar*.`,
    }, { quoted: m });
};

export const config = {
    name: 'desactivar',
    alias: ['disable', 'off'], // Alias más neutrales
    description: 'Permite a los administradores del grupo desactivar el bot en ese chat.',
    usage: '$desactivar',
    necesitaMetadata: true, // Necesita metadata para verificar si el usuario es admin.
};