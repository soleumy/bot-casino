// comandos/casarse.js

export default async function casarseHandler(sock, m, args, extra) {
    // Destructurar las variables necesarias del objeto 'extra'
    const { db, guardarEconomia, jid, isGroup, remitente } = extra;

    // Los matrimonios se almacenarán en db._parejas dentro de la estructura de tu DB global.
    // Inicializar db._parejas si no existe
    db._parejas = db._parejas || {};

    const menciones = m.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];

    // Este comando solo debe funcionar en grupos para la gestión de uniones
    if (!isGroup) {
        return sock.sendMessage(jid, { text: '✕ Este comando solo puede ser usado en grupos.' }, { quoted: m });
    }

    // El comando requiere 2 menciones para unir a dos personas
    if (menciones.length < 2) {
        return sock.sendMessage(
            jid,
            {
                text: `💍 *Para registrar una unión:*\n"Debes mencionar a *dos usuarios* para unirlos.\n\n_Ejemplo:_\n*$casarse @usuario1 @usuario2*"`
            },
            { quoted: m }
        );
    }

    // Usar los JIDs directamente de las menciones
    const persona1Jid = menciones[0];
    const persona2Jid = menciones[1];

    // Asegurarse de que los JIDs son válidos y distintos al bot
    const botId = sock.user?.id?.split(':')[0] + '@s.whatsapp.net';

    if (persona1Jid === botId || persona2Jid === botId) {
        return sock.sendMessage(jid, { text: '✕ El bot no puede unirse en matrimonio.' }, { quoted: m });
    }

    // No se puede unir a una persona consigo misma
    if (persona1Jid === persona2Jid) {
        return sock.sendMessage(
            jid,
            {
                text: '✕ No puedes unirte en matrimonio contigo mismo. Deben ser dos usuarios diferentes.',
            },
            { quoted: m }
        );
    }

    // El que ejecuta el comando es el oficiante, no debe ser una de las personas a unir.
    if (remitente === persona1Jid || remitente === persona2Jid) {
        return sock.sendMessage(
            jid,
            {
                text: '✕ No puedes ser el oficiante y uno de los participantes en la unión.',
            },
            { quoted: m }
        );
    }

    // Verificar si alguna de las personas ya está unida en la DB global de parejas
    let yaUnidaPersona1 = false;
    let yaUnidaPersona2 = false;
    let parejaActualPersona1 = null;
    let parejaActualPersona2 = null;

    // Iterar sobre todas las parejas registradas en db._parejas
    for (const clavePareja in db._parejas) {
        const [p1, p2] = clavePareja.split('|'); // Las claves son 'JID1|JID2' (ordenadas)

        if (p1 === persona1Jid) {
            yaUnidaPersona1 = true;
            parejaActualPersona1 = p2;
        } else if (p2 === persona1Jid) {
            yaUnidaPersona1 = true;
            parejaActualPersona1 = p1;
        }

        if (p1 === persona2Jid) {
            yaUnidaPersona2 = true;
            parejaActualPersona2 = p2;
        } else if (p2 === persona2Jid) {
            yaUnidaPersona2 = true;
            parejaActualPersona2 = p1;
        }
        // Si ambas ya están unidas, podemos salir temprano
        if (yaUnidaPersona1 && yaUnidaPersona2) break;
    }

    if (yaUnidaPersona1 || yaUnidaPersona2) {
        let mensajeError = '❌ No se puede realizar esta unión:\n\n';
        const mencionesError = [];

        if (yaUnidaPersona1) {
            mensajeError += `➡️ @${persona1Jid.split('@')[0]} ya está unido/a a @${parejaActualPersona1.split('@')[0]}.`;
            mencionesError.push(persona1Jid, parejaActualPersona1);
        }
        if (yaUnidaPersona2) {
            if (yaUnidaPersona1) mensajeError += '\n'; // Añadir salto de línea si ya hay un error
            mensajeError += `➡️ @${persona2Jid.split('@')[0]} ya está unido/a a @${parejaActualPersona2.split('@')[0]}.`;
            mencionesError.push(persona2Jid, parejaActualPersona2);
        }
        mensajeError += '\n\nPara formar una nueva unión, las uniones anteriores deben disolverse.';

        return sock.sendMessage(
            jid,
            { text: mensajeError, mentions: Array.from(new Set(mencionesError)) }, // Usar Set para evitar duplicados en menciones
            { quoted: m }
        );
    }

    // Realizar la unión
    // Almacenar la pareja de forma canónica (orden alfabético de JIDs)
    const idsOrdenados = [persona1Jid, persona2Jid].sort();
    const clavePareja = `${idsOrdenados[0]}|${idsOrdenados[1]}`;

    db._parejas[clavePareja] = {
        fechaUnion: new Date().toISOString(),
        grupoId: jid,
        oficiante: remitente
    };

    // Guardar los cambios en la base de datos global
    guardarEconomia();

    const nombre1 = `@${persona1Jid.split('@')[0]}`;
    const nombre2 = `@${persona2Jid.split('@')[0]}`;
    const oficianteTag = `@${remitente.split('@')[0]}`;

    const mensaje = `
 *¡Una nueva unión ha sido registrada!* 

Felicitaciones a:

 ${nombre1} y ${nombre2} 

Esta unión fue oficiada por ${oficianteTag}.

¡Les deseamos lo mejor en esta nueva etapa!
`;

    // URL de la imagen de casarse que tenías
    const imageUrl = 'https://i.pinimg.com/1200x/e0/be/eb/e0beeb99f22cd80f3aadc44e8ddc0077.jpg';

    await sock.sendMessage(
        jid,
        {
            image: { url: imageUrl },
            caption: mensaje,
            mentions: [persona1Jid, persona2Jid, remitente],
        },
        { quoted: m }
    );
};

export const config = {
    name: 'casarse',
    alias: ['unir', 'matrimonio'],
    description: 'Permite registrar una unión entre dos usuarios en el grupo. Solo se permite una unión por usuario.',
    usage: '$casarse @usuario1 @usuario2',
    necesitaMetadata: true, // Necesita metadata del grupo para obtener participantes y validar.
};