// comandos/tag.js
export default async (sock, m, args, extra) => {
    const { jid, isGroup, groupMembers } = extra;

    // 1. Validación: Solo se puede usar en grupos
    if (!isGroup) {
        return sock.sendMessage(jid, { text: '❌ Este comando solo puede ser usado en grupos.' }, { quoted: m });
    }

    // 2. Obtener el mensaje a "taggear" (mencionar)
    const messageToTag = args.join(' ');

    if (!messageToTag) {
        return sock.sendMessage(jid, { text: 'Uso: `$tag <tu mensaje>` para mencionar a todos sin mostrar las arrobas.' }, { quoted: m });
    }

    // 3. Extraer los JIDs de todos los participantes del grupo
    // Aseguramos que los JIDs estén en el formato correcto (@s.whatsapp.net)
    const participantJids = groupMembers.map(member => member.id.split('@')[0] + '@s.whatsapp.net');

    // 4. Enviar el mensaje con la lista de menciones
    // La clave para el "ghost tag" es incluir todos los JIDs en el array 'mentions'
    // sin necesidad de poner explícitamente '@' en el texto.
    // WhatsApp generalmente envía la notificación de mención sin mostrar los nombres en el chat.
    try {
        await sock.sendMessage(
            jid,
            {
                text: messageToTag,
                mentions: participantJids
            },
            { quoted: m }
        );
    } catch (error) {
        console.error("Error al realizar el tag fantasma:", error);
        return sock.sendMessage(
            jid,
            { text: '❌ Ocurrió un error al intentar mencionar a todos. Asegúrate de que el bot tenga permisos de administrador si el grupo está configurado así.' },
            { quoted: m }
        );
    }
};

export const config = {
    name: 'tag',
    alias: ['tagalll', 'todos', 'all'],
    description: 'Menciona a todos los miembros del grupo sin mostrar arrobas, solo el mensaje que proporciones.',
    usage: '$tag <tu mensaje>',
    necesitaMetadata: true, // Necesita acceso a la lista de miembros del grupo a través de la metadata.
    adminOnly: false, // Puedes cambiar a true si quieres que solo los administradores puedan usarlo.
};