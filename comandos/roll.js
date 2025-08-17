// comandos/roll.js

export default async function rollHandler(sock, m, args, extra) {
    const { jid, remitente, user, chatConfig, guardarEconomia } = extra;

    if (chatConfig.activo === false) {
        return sock.sendMessage(jid, { text: 'El bot esta inactivo en este chat. Usa *$activar* para reanudarlo.' }, { quoted: m });
    }

    const nombreUsuario = remitente.split('@')[0];

    // Función para simular el lanzamiento de 3d6 (tres dados de seis caras)
    const roll3d6 = () => {
        let sum = 0;
        for (let i = 0; i < 3; i++) {
            sum += Math.floor(Math.random() * 6) + 1;
        }
        return sum;
    };

    // --- Generación de Características Principales (3d6) ---
    const fuerza = roll3d6();
    const destreza = roll3d6();
    const constitucion = roll3d6();
    const inteligencia = roll33d6();
    const sabiduria = roll3d6();
    const carisma = roll3d6();

    // --- Generación de Atributos Adicionales ---
    const alturaCm = Math.floor(Math.random() * (200 - 150 + 1)) + 150; // Altura entre 150cm y 200cm
    const pesoKg = Math.floor(Math.random() * (100 - 50 + 1)) + 50; // Peso entre 50kg y 100kg
    const edadAnos = Math.floor(Math.random() * (80 - 18 + 1)) + 18; // Edad entre 18 y 80 años

    // --- Generación de Clase y Raza ---
    const clases = ['Guerrero', 'Mago', 'Picaro', 'Clerigo', 'Barbaro', 'Bardo', 'Paladin', 'Explorador', 'Monje', 'Druida', 'Hechicero', 'Brujo'];
    const claseAleatoria = clases[Math.floor(Math.random() * clases.length)];

    const razas = ['Humano', 'Elfo', 'Enano', 'Gnomo', 'Mediano', 'Draconido', 'Tifling', 'Orco', 'Semi-elfo', 'Semi-orco', 'Goliath', 'Tabaxi'];
    const razaAleatoria = razas[Math.floor(Math.random() * razas.length)];

    // --- Generación de Alineamiento ---
    const alineamientos = [
        'Legal Bueno', 'Neutral Bueno', 'Caotico Bueno',
        'Legal Neutral', 'Neutral', 'Caotico Neutral',
        'Legal Malvado', 'Neutral Malvado', 'Caotico Malvado'
    ];
    const alineamientoAleatorio = alineamientos[Math.floor(Math.random() * alineamientos.length)];

    // --- Generación de Trasfondo ---
    const trasfondos = ['Academico', 'Noble', 'Criminal', 'Soldado', 'Ermitaño', 'Artesano', 'Forastero', 'Enterrador', 'Marinero', 'Charlatan'];
    const trasfondoAleatorio = trasfondos[Math.floor(Math.random() * trasfondos.length)];

    // --- Mensaje de Resultado ---
    let mensaje = `--- Creacion de Personaje ---
Nombre de Usuario: ${nombreUsuario}

[ Detalle del Personaje ]
- Raza: ${razaAleatoria}
- Clase: ${claseAleatoria}
- Alineamiento: ${alineamientoAleatorio}
- Trasfondo: ${trasfondoAleatorio}

[ Atributos Fisicos ]
- Altura: ${alturaCm} cm
- Peso: ${pesoKg} kg
- Edad: ${edadAnos} anos

[ Estadisticas Principales ]
- Fuerza: ${fuerza}
- Destreza: ${destreza}
- Constitucion: ${constitucion}
- Inteligencia: ${inteligencia}
- Sabiduria: ${sabiduria}
- Carisma: ${carisma}

Este es un personaje generado aleatoriamente.`;

    // Opcional: guardar el personaje en el array `user.personajes`
    user.personajes = user.personajes || [];
    user.personajes.push({
        raza: razaAleatoria,
        clase: claseAleatoria,
        alineamiento: alineamientoAleatorio,
        trasfondo: trasfondoAleatorio,
        alturaCm,
        pesoKg,
        edadAnos,
        stats: {
            fuerza, destreza, constitucion, inteligencia, sabiduria, carisma
        },
        fechaCreacion: new Date().toISOString()
    });
    guardarEconomia(); // Guarda el personaje en la base de datos

    await sock.sendMessage(jid, { text: mensaje }, { quoted: m });
}

export const config = {
    name: 'roll',
    alias: ['rol', 'personaje', 'generar'], // Añadido 'generar'
    description: 'Genera caracteristicas y estadisticas aleatorias para un personaje.',
    usage: '$roll',
    necesitaMetadata: false,
};