const cooldowns = new Map(); // Se mantiene fuera para que persista entre usos del comando

export default async (sock, m, args, { user, guardarEconomia, jid, remitente }) => { // Desestructura directamente
    const ahora = Date.now();
    const anterior = cooldowns.get(remitente) || 0;

    // Asegurarse de que 'user.ultimaRecuperacion' esté inicializado
    user.ultimaRecuperacion ??= 0;

    // --- Regeneración de energía pasiva por intervalo ---
    const tiempoDesdeUltimaRecuperacion = ahora - user.ultimaRecuperacion;
    // 2 horas y 24 minutos en milisegundos: (2 * 60 * 60 * 1000) + (24 * 60 * 1000)
    const msPorIntervalo = 8640000; 

    if (tiempoDesdeUltimaRecuperacion >= msPorIntervalo) {
        const intervalosPasados = Math.floor(tiempoDesdeUltimaRecuperacion / msPorIntervalo);
        const energiaRecuperada = intervalosPasados * 10; // 10 de energía por cada intervalo de 2h 24m
        user.energia = Math.min(100, user.energia + energiaRecuperada); // Máximo 100 de energía
        user.ultimaRecuperacion = ahora; // Actualiza la última recuperación de energía
    } else if (user.ultimaRecuperacion === 0) { // En caso de que sea la primera vez que usa el comando
        user.ultimaRecuperacion = ahora;
    }

    // Asegurarse de que 'estados' exista
    user.estados ??= {};

    // --- Determinación del Cooldown ---
    let tiempoEspera = 60 * 1000; // 1 minuto (60 segundos)

    // Ajusta las claves de los estados para que coincidan con los nombres de la tienda:
    if (user.estados.alcohol && user.estados.alcohol > ahora) { // "Bebida Energética" (antes Infusión de Rocío Estelar)
        tiempoEspera = 30 * 1000; // 30 segundos
    } else if (user.estados.saviaVital && user.estados.saviaVital > ahora) { // "Cafe Fuerte" (antes Esencia Vital de la Luz)
        tiempoEspera = 45 * 1000; // 45 segundos
    }

    // --- Verificación de Energía ---
    const energiaRequerida = 20; // Costo de energía por "trabajo"
    if (user.energia < energiaRequerida) {
        return sock.sendMessage(jid, {
            text: `*Crupier:*\n"Te veo un poco agotado. Necesitas mas energia para este tipo de 'trabajo'.\n♦️ Energia de Juego disponible: *${user.energia}/${energiaRequerida}*\n\n_Recupera tu energia con un cafe o espera un poco._`
        }, { quoted: m });
    }

    // --- Verificación de Cooldown ---
    if (ahora - anterior < tiempoEspera) {
        const segundosRestantes = Math.ceil((tiempoEspera - (ahora - anterior)) / 1000);
        return sock.sendMessage(jid, {
            text: `⏳ *Crupier:*\n"¡Calma! Ya hiciste tu jugada. Debes esperar *${segundosRestantes} segundos* antes de volver a la accion."`
        }, { quoted: m });
    }

    // --- Lógica del Trabajo (Empleos del Casino) ---
    // Aunque el trabajo específico no se muestra en el mensaje final, se mantiene para la lógica interna
    const empleosCasino = [
        'organizador de apuestas', 'barman clandestino', 'limpiador de mesas', 'recolector de fichas sueltas',
        'vigilante de camaras', 'distribuidor de cartas', 'comprobador de dados', 'cargador de tragaperras',
        'crupier de mesa de bajo nivel' // Empleos tematizados para casino
    ];
    // const trabajo = empleosCasino[Math.floor(Math.random() * empleosCasino.length)]; // No usado en el mensaje final

    let recompensa = Math.floor(Math.random() * (3000 - 600 + 1)) + 600; // Fichas base entre 600 y 3000
    const xpGanada = Math.floor(Math.random() * 16) + 10; // XP base entre 10 y 25

    // Bonificaciones por estados activos
    if (user.estados.contratoChaman && user.estados.contratoChaman > ahora) { // 'Pacto con el Don Casino' (antes Pacto del Guardian Lumínico)
        recompensa *= 2; // Duplica ganancias
    }
    if (user.estados.bonusTrabajo && user.estados.bonusTrabajo > ahora) { // Asumo que bonusTrabajo es una clave generica
        recompensa = Math.floor(recompensa * 1.10); // +10%
    }
    // Si hay un estado de la tienda como 'pergamino-oraculo' ('Libro de Estrategias') que afecte las ganancias
    if (user.estados.pergaminoOraculo && user.estados.pergaminoOraculo > ahora) {
        recompensa = Math.floor(recompensa * 1.25); // Ejemplo: +25% de ganancias
    }

    // --- Actualizar Datos del Usuario ---
    user.dinero += recompensa;
    user.experiencia += xpGanada;
    user.energia -= energiaRequerida;
    user.ultimaRecuperacion = ahora; // Siempre actualiza la última recuperación de energía tras trabajar

    // --- Nivel Up ---
    let subidas = 0;
    while (user.experiencia >= user.nivel * 100) {
        user.experiencia -= user.nivel * 100;
        user.nivel += 1;
        subidas++;
    }

    // --- Guardar Cooldown del Comando ---
    cooldowns.set(remitente, ahora);

    // --- Marcar para Guardar la Economía ---
    guardarEconomia();

    // --- Construir Mensaje Final según el formato solicitado ---
    let mensaje = `🃏 ° Tras cumplir tus responsabilidades y fomentar el cumplimiento de tus obligaciones obtuviste:\n\n`;
    mensaje += `    ♤  •  Cantidad obtenida: *${recompensa} Dinero*\n`;
    mensaje += `    ♧  •  Experiencia obtenida: *${xpGanada} XP*\n`;
    mensaje += `    ♡  •  Energía restante: *${user.energia}*\n\n`;
    mensaje += `Dinero actual: ${user.dinero}\n`;
    mensaje += `Nivel: ${user.nivel} (XP: ${user.experiencia})`;

    if (subidas > 0) {
        mensaje += `\n\n📈 *¡Has subido al Nivel de Jugador ${user.nivel}!* 🏅 Sigue acumulando experiencia en las mesas.`; // Mantenemos el mensaje de nivel
    }

    return sock.sendMessage(jid, { text: mensaje }, { quoted: m });
};

export const config = {
    name: 'trabajar', // Nombre del comando
    alias: ['work', 'job', 'currar'], // Alias
    description: 'Realiza un trabajo en el casino para ganar dinero y experiencia.', // Actualizada la descripción para decir "dinero"
    usage: '$trabajar',
    necesitaMetadata: false, // No necesita metadata de grupo.
};