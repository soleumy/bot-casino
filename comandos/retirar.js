// comandos/retirar.js
export default async (sock, m, args, { user, guardarEconomia, jid, remitente }) => {
    // user es el objeto de datos del usuario actual, gestionado por index.mjs

    const cantidad = parseInt(args[0]);

    // Validar que se ha proporcionado una cantidad válida y positiva
    if (isNaN(cantidad) || cantidad <= 0) {
        return sock.sendMessage(
            jid,
            {
                text: '❌ *Cajero:*\n"Por favor, indique una cantidad válida y positiva de fichas para retirar de su caja fuerte del casino.\n♦️ Ejemplo: *$retirar 1000*"'
            },
            { quoted: m }
        );
    }

    // Verificar si el usuario tiene suficientes fichas en la caja fuerte
    if (user.banco < cantidad) {
        return sock.sendMessage(
            jid,
            {
                text: `❌ *Cajero:*\n"Su caja fuerte no tiene suficientes fichas para esa cantidad.\n♦️ Saldo actual en caja fuerte: *${user.banco} fichas*."`
            },
            { quoted: m }
        );
    }

    // Realizar la operación de retiro
    user.banco -= cantidad; // Deducir de la caja fuerte
    user.dinero += cantidad;  // Añadir al dinero en mano (fichas en mano)

    // Marcar para guardar los cambios
    guardarEconomia();

    // Mensaje de confirmación
    return sock.sendMessage(
        jid,
        {
            text: `🏦 *¡@${remitente.split('@')[0]} ha retirado ♦️ *${cantidad} fichas* de la caja fuerte del casino!♦️\n\n` +
                  `♦️ Fichas en mano: *${user.dinero} fichas*\n` +
                  `🏦 Fichas en caja fuerte: *${user.banco} fichas*`,
            mentions: [remitente]
        },
        { quoted: m }
    );
};

export const config = {
    name: 'retirar',
    alias: ['withdraw', 'sacar'],
    description: 'Permite a los usuarios retirar fichas de su caja fuerte del casino a su saldo en mano.',
    usage: '$retirar <cantidad>',
    necesitaMetadata: false, // No necesita metadata de grupo.
};