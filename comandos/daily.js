export default async (sock, m, args, extra) => {
    // Destructuramos las variables necesarias del objeto 'extra'
    const { user, jid, remitente, guardarEconomia } = extra;

    const now = new Date();
    const hoy = now.toISOString().split('T')[0]; // Formato YYYY-MM-DD

    // Aseguramos que la propiedad 'ultimaRecompensa' exista en el objeto de usuario.
    user.ultimaRecompensa ??= null;

    // Comprobamos si el usuario ya recibió la recompensa hoy
    if (user.ultimaRecompensa === hoy) {
        return sock.sendMessage(jid, {
            text: '🎰 *Crupier:*\n"Ya recogiste tus ganancias diarias, socio... ¡Vuelve a medianoche para otra oportunidad!"'
        }, { quoted: m });
    }

    // Calculamos la recompensa (entre 2000 y 5000 fichas/monedas)
    const recompensa = Math.floor(Math.random() * 3000) + 2000;

    // Sumamos la recompensa al dinero del usuario
    user.dinero += recompensa;
    // Actualizamos la fecha de la última recompensa
    user.ultimaRecompensa = hoy;

    // Marcamos que hay cambios en la base de datos para que se guarden
    guardarEconomia();

    // URL de la imagen original (se mantiene)
    const imageUrl = 'https://i.pinimg.com/736x/68/e4/f1/68e4f1f836592ad262aafb259a58ff11.jpg';

    await sock.sendMessage(jid, {
        image: { url: imageUrl },
        caption: `🃏 *¡Bienvenido al Bono Diario del Casino!* 🃏\n\n💰 Has reclamado tu bono de *${recompensa} fichas*.\n\n📅 ¡La próxima tirada de suerte es en 24 horas!`,
        mentions: [remitente] // Menciona al usuario que recibió la recompensa
    }, { quoted: m });
};

export const config = {
    name: 'daily',
    alias: ['diario', 'bono'],
    description: 'Permite a los usuarios reclamar un bono diario de fichas en el casino.',
    usage: '$daily',
    cooldown: 24 * 60 * 60, // 24 horas
    necesitaMetadata: false, // No necesita metadata de grupo.
};