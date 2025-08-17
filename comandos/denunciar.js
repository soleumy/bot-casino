// comandos/denuncia.js

export default async function denunciaHandler(sock, m, args, extra) {
    const { jid, isGroup } = extra;

    // Este comando solo tiene sentido en grupos
    if (!isGroup) {
        return sock.sendMessage(jid, {
            text: '✕ Este comando solo puede ser usado en grupos.',
        }, { quoted: m });
    }

    // Obtener metadata del grupo para sacar los admins
    const metadata = await sock.groupMetadata(jid);
    const admins = metadata.participants
        .filter(p => p.admin === 'admin' || p.admin === 'superadmin')
        .map(p => p.id);

    if (admins.length === 0) {
        return sock.sendMessage(
            jid,
            { text: '⚠️ No se encontraron administradores en este grupo para atender la denuncia.' },
            { quoted: m }
        );
    }

    const mencionAdmins = admins.map(id => `@${id.split('@')[0]}`).join(' ');

    const mensaje = `
🚨 **¡Alerta! Se ha generado una denuncia en el grupo.** 🚨

Se ha reportado una situación que requiere la atención de los administradores.

Por favor, revisen el chat para más detalles.

Atención, administradores:
${mencionAdmins}

_Este mensaje es una notificación automática del sistema de denuncia._
`;

    try {
        await sock.sendMessage(
            jid,
            {
                text: mensaje,
                mentions: admins
            },
            { quoted: m }
        );
    } catch (error) {
        console.error("Error al enviar la denuncia:", error);
        await sock.sendMessage(jid, {
            text: '✕ Ocurrió un error al intentar enviar la denuncia. Por favor, intenta de nuevo más tarde.'
        }, { quoted: m });
    }
};

export const config = {
    name: 'denunciar',
    alias: ['report', 'queja'],
    description: 'Permite a los usuarios enviar una denuncia o reportar un problema a los administradores del grupo.',
    usage: '$denuncia',
    necesitaMetadata: true, // Necesita metadata del grupo para obtener a los administradores.
};