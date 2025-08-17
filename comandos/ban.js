// comandos/ban.js

export default async function banHandler(sock, m, args, extra) {
    const mencionados = m.message?.extendedTextMessage?.contextInfo?.mentionedJid;

    if (!mencionados || mencionados.length === 0) {
        return sock.sendMessage(m.key.remoteJid, {
            text: '🎰 *Crupier del Casino dice:*\n"Para retirar a un jugador de la mesa, debes señalarlo. Menciona al usuario a quien le retirarás las fichas. Ejemplo: *$ban @jugador*"'
        }, { quoted: m });
    }

    const grupo = m.key.remoteJid;
    const objetivo = mencionados[0];

    const metadata = await sock.groupMetadata(grupo);
    const participantes = metadata.participants;

    const autor = m.key.participant || m.participant || m.key.remoteJid;
    const botId = sock.user?.id?.split(':')[0] + '@s.whatsapp.net'; 

    const esAdmin = participantes.some(p => p.id === autor && ['admin', 'superadmin'].includes(p.admin));
    const esBotAdmin = participantes.some(p => p.id === botId && ['admin', 'superadmin'].includes(p.admin));

    if (!esAdmin) {
        return sock.sendMessage(grupo, {
            text: '✕ *Solo los Gerentes de Casino tienen esta autoridad.*\n\nÚnicamente los administradores del grupo pueden tomar estas decisiones en la mesa de juego.'
        }, { quoted: m });
    }

    if (!esBotAdmin) {
        return sock.sendMessage(grupo, {
            text: '✕ *No tengo los permisos para ejecutar esta expulsión.*\n\nPara retirar a un jugador, debo ser un *Gerente de Casino* (administrador del grupo).'
        }, { quoted: m });
    }

    try {
        await sock.groupParticipantsUpdate(grupo, [objetivo], 'remove');
        await sock.sendMessage(grupo, {
            text: `♠️ @${objetivo.split('@')[0]} ha sido *retirado de la mesa*. La casa se reserva el derecho de admisión.`,
            mentions: [objetivo]
        });
    } catch (err) {
        console.error('✕ Error al retirar al jugador:', err);
        await sock.sendMessage(grupo, {
            text: '✕ Falló la jugada. No pude retirar a ese jugador de la mesa en este momento.'
        }, { quoted: m });
    }
};

export const config = {
    name: 'ban',
    alias: ['kick', 'expulsar', 'retirar'], // Añadido 'retirar' como alias de casino
    description: 'Permite al bot retirar a un miembro del grupo, como un Crupier expulsando a un jugador de la mesa. Solo para administradores.',
    usage: '$ban @usuario',
    necesitaMetadata: true, // Este comando necesita metadatos del grupo para verificar admins.
};