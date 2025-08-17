// comandos/murmurar.js

// Importa las utilidades necesarias si las tienes en otro archivo
// import { getRandomNumber } from '../utils/math.js';
// import { chance } from '../utils/chance.js';

export default async function murmurarHandler(sock, m, args, extra) {
    const { jid, remitente, user, chatConfig, guardarEconomia } = extra;

    // Asegúrate de que el chatConfig.activo existe y es true (o el comando es siempre activo)
    if (chatConfig.activo === false) {
        return sock.sendMessage(jid, { text: '--- El bot esta desactivado en este grupo. Usa *$activar* para reactivarlo. ---' }, { quoted: m });
    }

    const cooldown = 2 * 60 * 1000; // 2 minutos en milisegundos (ajustado para un "murmurar" más frecuente, 1 hora antes)
    const ahora = Date.now();

    if (user.ultimaAccion && (ahora - user.ultimaAccion < cooldown)) {
        const tiempoRestante = cooldown - (ahora - user.ultimaAccion);
        const minutos = Math.floor(tiempoRestante / (60 * 1000));
        const segundos = Math.floor((tiempoRestante % (60 * 1000)) / 1000);
        return sock.sendMessage(jid, { text: `--- Silencio, @${remitente.split('@')[0]} --- La voz necesita descansar. Inténtalo de nuevo en *${minutos}m ${segundos}s*.` }, { quoted: m, mentions: [remitente] });
    }

    // Lógica del "murmurar"
    const cantidadConseguida = Math.floor(Math.random() * 5000) + 1000; // Ejemplo: entre 1000 y 5999 de dinero
    const experienciaGanada = Math.floor(Math.random() * 10) + 50; // Ejemplo: entre 50 y 59 de experiencia

    user.dinero = (user.dinero || 0) + cantidadConseguida;
    user.experiencia = (user.experiencia || 0) + experienciaGanada;
    user.ultimaAccion = ahora; // Actualiza la última acción

    // Lógica de subida de nivel
    // const nivelAnterior = user.nivel; // No es necesario si no lo usas
    while (user.experiencia >= (user.nivel * 100)) { // Ejemplo: 100 XP para nivel 2, 200 para nivel 3, etc.
        user.experiencia -= (user.nivel * 100);
        user.nivel += 1;
        await sock.sendMessage(jid, { text: `--- ¡@${remitente.split('@')[0]} ha alcanzado el Nivel ${user.nivel}! --- ¡Tu elocuencia crece!` }, { quoted: m, mentions: [remitente] });
    }

    guardarEconomia(); // Guarda los cambios en la economía

    await sock.sendMessage(jid, {
        text: `¡Has murmurado con exito!
♤  •  Conseguiste ${cantidadConseguida} Dinero 
♧  •  Has ganado ${experienciaGanada} de experiencia 

Dinero actual: ${user.dinero} 
Nivel: ${user.nivel} (XP: ${user.experiencia})`
    }, { quoted: m });
}

export const config = {
    name: 'murmurar',
    alias: ['whisper', 'susurrar'], // Cambiando alias
    description: 'Permite al usuario murmurar para ganar dinero y experiencia.', // Cambiando descripción
    usage: '$murmurar',
    necesitaMetadata: false, // No necesita metadatos adicionales de grupo por ahora
};