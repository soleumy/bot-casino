export default async function rankingHandler(sock, m, args, extra) {
    const { jid, isGroup, db } = extra;

    // Validación: solo se puede usar en grupos
    if (!isGroup) {
        return sock.sendMessage(
            jid,
            { text: '◇ 𝗖𝖱𝖴𝖯𝗜𝗘𝗥 ◇\n"Este ranking de fortunas solo se revela en los salones privados de los grupos, no en solitario."' },
            { quoted: m }
        );
    }

    try {
        const groupUsers = db[jid]?.users || {}; // Obtener todos los usuarios del grupo actual
        
        // Convertir el objeto de usuarios a un array para poder ordenarlo
        // Filtra usuarios que no tienen dinero o tienen 0, y extrae su JID y dinero.
        const players = Object.keys(groupUsers)
            .map(userJid => ({
                id: userJid,
                dinero: groupUsers[userJid].dinero || 0 // Asegurarse de que el dinero sea al menos 0
            }))
            .filter(player => player.dinero > 0); // Solo jugadores con dinero

        // Ordenar los jugadores por dinero de forma descendente
        players.sort((a, b) => b.dinero - a.dinero);

        // Tomar solo el top 10 (o menos si hay menos jugadores)
        const topPlayers = players.slice(0, 10);

        let mensaje = `◇ 𝗖𝖱𝖴𝖯𝗜𝗘𝗥 ◇\n\n🏆 *Ranking de Grandes Apostadores* 💰\n\n`;
        let mentionedJids = []; // <<< MOVED DECLARATION HERE TO ALWAYS BE DEFINED

        if (topPlayers.length === 0) {
            mensaje += "No hay fortunas registradas aún en este casino. ¡Que las apuestas comiencen!";
        } else {
            topPlayers.forEach((player, index) => {
                const userName = player.id.split('@')[0];
                mensaje += `${index + 1}. @${userName} - *${player.dinero} Dinero*\n`;
                mentionedJids.push(player.id); // Añadir el JID para que sea mencionado
            });
            mensaje += "\n_¡La mesa siempre tiene espacio para un nuevo millonario!_";
        }

        await sock.sendMessage(
            jid,
            { text: mensaje, mentions: mentionedJids }, // No necesita || [] aquí porque ya está inicializado como []
            { quoted: m }
        );

    } catch (error) {
        console.error("Error al generar el ranking:", error);
        return sock.sendMessage(
            jid,
            { text: '◇ 𝗖𝖱𝖴𝖯𝗜𝗘𝗥 ◇\n"Ha ocurrido un fallo inesperado al calcular las fortunas. Intenta de nuevo más tarde."' },
            { quoted: m }
        );
    }
}

export const config = {
    name: 'ranking',
    alias: ['top', 'richest', 'fortunas'],
    description: 'Muestra el ranking de los jugadores más adinerados del grupo.',
    usage: '$ranking',
    necesitaMetadata: true, // Necesita metadata del grupo para acceder a sus usuarios
};