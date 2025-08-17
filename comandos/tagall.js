// comandos/tagall.js
export default async (sock, m, args, extra) => {
    const jid = m.key.remoteJid;

    // Verifica que sea un grupo
    if (!jid.endsWith('@g.us')) {
        return sock.sendMessage(
            jid,
            {
                text: '❌ Este comando solo puede ser usado en grupos.'
            },
            { quoted: m }
        );
    }

    try {
        // Obtener metadatos del grupo
        const metadata = await sock.groupMetadata(jid);
        const participants = metadata.participants;

        if (!participants || participants.length === 0) {
            return sock.sendMessage(
                jid,
                {
                    text: '❌ No hay participantes en este grupo para mencionar.'
                },
                { quoted: m }
            );
        }

        // Obtener todos los JIDs para mencionar
        const menciones = participants.map(p => p.id);

        // Unir los argumentos para formar el mensaje proporcionado por el usuario
        const userMessage = args.join(' ').trim(); // .trim() para limpiar espacios al inicio/final

        // Construir el texto con menciones de los participantes
        const textoMenciones = menciones
            .map(id => `@${id.split('@')[0]}`)
            .join(' '); // Unir con espacio para que no sea una lista vertical por defecto

        // Determine the final message content
        let finalMessage = '';
        if (userMessage) {
            // If user provided a message, use it and append mentions.
            // Mentions will be at the end, allowing the user's message to be primary.
            finalMessage = `${userMessage}\n\n${textoMenciones}`;
        } else {
            // If no user message, just send the mentions.
            finalMessage = textoMenciones;
        }

        // Enviar mensaje con menciones
        await sock.sendMessage(
            jid,
            {
                text: finalMessage,
                mentions: menciones,
            },
            { quoted: m }
        );
    } catch (err) {
        console.error('❌ Error en tagall:', err);
        await sock.sendMessage(
            jid,
            {
                text: '❌ Ocurrió un error al intentar mencionar a todos los participantes.'
            },
            { quoted: m }
        );
    }
};

// Configuración del comando
export const config = {
    name: 'tagall',
    alias: ['mencionartodos', 'all'], // Eliminado 'invocar' para ser más neutral
    description: 'Menciona a todos los participantes del grupo con un mensaje opcional proporcionado por el usuario.',
    usage: '$tagall [mensaje_opcional]',
    necesitaMetadata: true, // Este comando sí necesita metadata de grupo.
};