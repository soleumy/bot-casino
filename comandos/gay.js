export default async (sock, m) => {
    const chatJid = m.key.remoteJid; // JID del chat
    const usuario = m.key.participant || m.key.remoteJid; // JID del usuario
    const nombreUsuario = m.pushName || usuario.split('@')[0]; // Nombre del usuario o su número

    const porcentaje = Math.floor(Math.random() * 101); // Generar un porcentaje aleatorio entre 0 y 100

    const mensaje = `
📊 *Resultados de la prueba:*

Estimado(a) ${nombreUsuario}, su porcentaje de homosexualidad es del *${porcentaje}%*.

`;

    await sock.sendMessage(
        chatJid,
        {
            text: mensaje,
            mentions: [usuario] // Asegúrate de mencionar al usuario
        },
        { quoted: m }
    );
};

export const config = {
    name: 'gay',
    alias: ['lgbt', 'pride', 'porcentaje'], // Añadido 'porcentaje' para ser más neutral
    description: 'Calcula un porcentaje aleatorio para el usuario.',
    usage: '$gay',
    necesitaMetadata: false, // No necesita metadata de grupo.
};