// comandos/activar.js

export default async function activarHandler(sock, m, args, extra) {
    const { jid, obtenerDatosDelChat } = extra;

    // Obtener metadata del grupo
    const metadata = await sock.groupMetadata(jid);
    const participants = metadata.participants;

    // Verificar si el usuario es administrador
    const usuario = m.key.participant || m.key.remoteJid;
    const esAdmin = participants?.some(p =>
        p.id === usuario && (p.admin === 'admin' || p.admin === 'superadmin')
    );

    if (!esAdmin) {
        return sock.sendMessage(jid, {
            text: `✕ *Acceso denegado.*\n\nSolo los administradores del grupo pueden usar este comando.`
        }, { quoted: m });
    }

    // Asegúrate de que chatConfig esté inicializado para este jid
    obtenerDatosDelChat(jid, m.key.participant, true); 

    // Activar el bot en la base de datos
    extra.chatConfig.activo = true; 
    extra.guardarEconomia(); 

    return sock.sendMessage(jid, {
        text: `♦️  *Bot activado.*\n\n¡Estoy operativo en este grupo!\n\nUsa *$help* para ver todos los comandos disponibles.`
    }, { quoted: m });
};

export const config = {
    name: 'activar',
    alias: ['enable', 'on'],
    description: 'Activa las funciones del bot en el grupo. Solo para administradores.',
    usage: '$activar',
    necesitaMetadata: true, 
};