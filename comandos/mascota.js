// comandos/mascota.js
export default async (sock, m, args, { user, jid, guardarEconomia }) => {
    // 'user' ya es la referencia directa a economiaGlobal[jid].users[remitente]
    // y ya tiene user.mascota inicializado a null por index.mjs

    // Normaliza la entrada del usuario para los subcomandos
    const subcomando = args[0]?.toLowerCase();

    // Definición de mascotas (Solo animales existentes o extintos, incluyendo dinosaurios)
    const PET_TYPES = {
        // Animales Actuales
        perro: { emoji: '🐶', name: 'perro', description: 'Un leal compañero, siempre dispuesto a seguirte.', category: 'actual' },
        gato: { emoji: '🐱', name: 'gato', description: 'Elegante y misterioso, te acompaña con gracia.', category: 'actual' },
        zorro: { emoji: '🦊', name: 'zorro', description: 'Astuto y silencioso, se mueve entre las sombras y la luz.', category: 'actual' },
        buho: { emoji: '🦉', name: 'búho', description: 'Sabio guardián de la noche, sus ojos lo ven todo.', category: 'actual' },
        lobo: { emoji: '🐺', name: 'lobo', description: 'Fiel y valiente, aúlla a la luna y protege a su manada.', category: 'actual' },
        nutria: { emoji: '🦦', name: 'nutria', description: 'Juguetona y ágil, ama las corrientes y los tesoros escondidos.', category: 'actual' },
        panda: { emoji: '🐼', name: 'panda', description: 'Tranquilo y majestuoso, un símbolo de paz y fortuna.', category: 'actual' },
        conejo: { emoji: '🐰', name: 'conejo', description: 'Rápido y escurridizo, trae suerte y agilidad.', category: 'actual' },
        erizo: { emoji: '🦔', name: 'erizo', description: 'Pequeño y protector, se enrolla ante el peligro.', category: 'actual' },
        mapache: { emoji: '🦝', name: 'mapache', description: 'Curioso y astuto, siempre buscando nuevas aventuras.', category: 'actual' },
        camaleon: { emoji: '🦎', name: 'camaleón', description: 'Maestro del camuflaje, se adapta a cualquier entorno.', category: 'actual' },
        lobezno: { emoji: '🐺', name: 'lobezno', description: 'Un cachorro de lobo, juguetón y prometedor.', category: 'actual' },
        tigre: { emoji: '🐅', name: 'tigre', description: 'Feroz y solitario, un depredador de gran poder y belleza.', category: 'actual' },
        halcon: { emoji: '🦅', name: 'halcón', description: 'Veloz y con vista aguda, un cazador nato del cielo.', category: 'actual' },
        koala: { emoji: '🐨', name: 'koala', description: 'Tranquilo y dormilón, ama la paz y la relajación.', category: 'actual' },
        jaguar: { emoji: '🐆', name: 'jaguar', description: 'Poderoso y sigiloso, rey de la selva y maestro de la caza.', category: 'actual' },
        delfin: { emoji: '🐬', name: 'delfín', description: 'Inteligente y amigable, el espíritu libre de los océanos.', category: 'actual' },
        tortuga: { emoji: '🐢', name: 'tortuga', description: 'Sabia y longeva, un símbolo de paciencia y longevidad.', category: 'actual' },
        serpiente: { emoji: '🐍', name: 'serpiente', description: 'Misteriosa y ágil, portadora de sabiduría ancestral.', category: 'actual' },
        cangrejo: { emoji: '🦀', name: 'cangrejo', description: 'Resistente y protector, con una armadura natural.', category: 'actual' },
        pulpo: { emoji: '🐙', name: 'pulpo', description: 'Ingenioso y adaptable, un maestro del camuflaje marino.', category: 'actual' },
        medusa: { emoji: '🦑', name: 'medusa', description: 'Elegante y etérea, una danza de luces en las profundidades.', category: 'actual' },
        pinguino: { emoji: '🐧', name: 'pingüino', description: 'Divertido y sociable, un experto en las tierras heladas.', category: 'actual' },
        reno: { emoji: '🦌', name: 'reno', description: 'Noble y resistente, guía en los caminos nevados.', category: 'actual' },
        buho_nival: { emoji: '🦉', name: 'búho nival', description: 'Majestuoso cazador del frío, sus alas son el silencio.', category: 'actual' },
        oso_polar: { emoji: '🐻‍❄️', name: 'oso polar', description: 'Imponente y poderoso, rey de los hielos.', category: 'actual' },
        cabra: { emoji: '🐐', name: 'cabra', description: 'Ágil y curiosa, se adapta a cualquier terreno.', category: 'actual' },
        oveja: { emoji: '🐑', name: 'oveja', description: 'Dócil y pacífica, su presencia trae calma.', category: 'actual' },
        cerdo: { emoji: '🐖', name: 'cerdo', description: 'Inteligente y de buen corazón, un compañero leal.', category: 'actual' },
        vaca: { emoji: '🐄', name: 'vaca', description: 'Robusta y nutritiva, un símbolo de abundancia.', category: 'actual' },
        gallina: { emoji: '🐔', name: 'gallina', description: 'Diligente y atenta, provee sustento diario.', category: 'actual' },
        pato: { emoji: '🦆', name: 'pato', description: 'Nadador gracioso, un espíritu libre en el agua.', category: 'actual' },
        cisne: { emoji: '🦢', name: 'cisne', description: 'Elegante y sereno, su belleza calma el alma.', category: 'actual' },
        pavo_real: { emoji: '🦚', name: 'pavo real', description: 'Orgulloso y deslumbrante, un despliegue de colores.', category: 'actual' },
        loro: { emoji: '🦜', name: 'loro', description: 'Hablador y carismático, repite ecos del santuario.', category: 'actual' },
        tortuga_marina: { emoji: '🐢', name: 'tortuga marina', description: 'Antigua viajera de los océanos, guardiana de secretos.', category: 'actual' },
        foca: { emoji: '🦭', name: 'foca', description: 'Juguetona y curiosa, vive entre el hielo y el mar.', category: 'actual' },
        nutria_marina: { emoji: '🦦', name: 'nutria marina', description: 'Pequeña y sociable, experta en el cuidado de su tesoro.', category: 'actual' },
        camello: { emoji: '🐪', name: 'camello', description: 'Resistente y paciente, atraviesa los desiertos etéreos.', category: 'actual' },
        llama: { emoji: '🦙', name: 'llama', description: 'Calmada y elegante, un símbolo de las alturas andinas.', category: 'actual' },
        hipopotamo: { emoji: '🦛', name: 'hipopótamo', description: 'Poderoso y territorial, domina las aguas tranquilas.', category: 'actual' },
        rinoceronte: { emoji: '🦏', name: 'rinoceronte', description: 'Imponente y fuerte, un guardián de la tierra.', category: 'actual' },
        gorila: { emoji: '🦍', name: 'gorila', description: 'Majestuoso y protector, un rey de la jungla.', category: 'actual' },
        chimpance: { emoji: '🐒', name: 'chimpancé', description: 'Inteligente y adaptable, un imitador de la sabiduría.', category: 'actual' },
        perezoso: { emoji: '🦥', name: 'perezoso', description: 'Relajado y lento, un maestro de la paciencia.', category: 'actual' },
        canguro: { emoji: '🦘', name: 'canguro', description: 'Salto ágil y maternal, un protector de los suyos.', category: 'actual' },
        cebra: { emoji: '🦓', name: 'cebra', description: 'Única y distintiva, un patrón de vida salvaje.', category: 'actual' },
        jirafa: { emoji: '🦒', name: 'jirafa', description: 'Alta y elegante, ve el mundo desde una perspectiva elevada.', category: 'actual' },
        elefante: { emoji: '🐘', name: 'elefante', description: 'Sabio y majestuoso, con memoria de los ancestros.', category: 'actual' },
        leon: { emoji: '🦁', name: 'león', description: 'Valiente y regio, el verdadero rey de la sabana.', category: 'actual' },
        guepardo: { emoji: '🐆', name: 'guepardo', description: 'Veloz y grácil, el cazador más rápido.', category: 'actual' },
        hiena: { emoji: '🐺', name: 'hiena', description: 'Astuta y adaptable, vive en las sombras de la noche.', category: 'actual' },
        cocodrilo: { emoji: '🐊', name: 'cocodrilo', description: 'Antiguo y formidable, un depredador de las aguas.', category: 'actual' },
        tiburón: { emoji: '🦈', name: 'tiburón', description: 'Imponente y poderoso, el depredador del océano.', category: 'actual' },
        ballena: { emoji: '🐳', name: 'ballena', description: 'Gigante y misteriosa, la voz de las profundidades marinas.', category: 'actual' },

        // Dinosaurios y Animales Prehistóricos Extintos - Reducidos
        tiranosaurio: { emoji: '🦖', name: 'tiranosaurio', description: 'El rey de los dinosaurios, temible depredador.', category: 'extinto' },
        triceratops: { emoji: '🦕', name: 'triceratops', description: 'Robusto herbívoro con tres cuernos, un gigante pacífico.', category: 'extinto' },
    };

    // Función para formatear la lista de mascotas
    const formatPetList = () => {
        let allPets = []; // Usaremos una sola lista para mantener el orden alfabético general

        for (const key in PET_TYPES) {
            const pet = PET_TYPES[key];
            allPets.push(` ៸៸🎰 ₊˚ ﹫${pet.name.charAt(0).toUpperCase() + pet.name.slice(1)}.`); // Capitaliza la primera letra
        }

        // Ordenar alfabéticamente
        allPets.sort((a, b) => {
            const nameA = a.split('﹫')[1].replace('.', '').trim();
            const nameB = b.split('﹫')[1].replace('.', '').trim();
            return nameA.localeCompare(nameB);
        });

        const petListString = allPets.join('\n');

        let message = `ㅤㅤ ㅤֺ🪙⃟ֵ̈ㅤֺ 𝗠𝗔𝗦𝗖𝗢𝗧𝗔𝗦 ☆̸̷ᩧ Ꮺ

⏝ ͝ 𑄹 𝅄ㅤ ㅤ Con gran variedad de mascotas a elección, en esta tienda podrás encontrar el acompañante que prefieras. Para conseguirlos se debe usar el comando correspondiente y colocar correctamente el nombre en minúsculas, en caso de que el nombre sea compuesto por dos palabras se usa el guión bajo: *pavo_real* y sin ninguna puntuación.

${petListString}`; // Inyecta la lista de mascotas formateada

        return message;
    };

    // Subcomando "tipos"
    if (subcomando === 'tipos') {
        await sock.sendMessage(jid, { text: formatPetList() }, { quoted: m });
        return;
    }

    // Subcomando "info"
    if (subcomando === 'info') {
        if (user.mascota) {
            const petInfo = PET_TYPES[user.mascota.tipo];
            if (petInfo) {
                await sock.sendMessage(jid, { 
                    text: `⏝ ͝    𑄹   𝅄ㅤ   ㅤ *Información de tu mascota:*\n\n` +
                          `➜ ㅤ ㅤ ﹟     Tipo ; ${petInfo.emoji} ${petInfo.name}\n` +
                          `➜ ㅤ ㅤ ﹟     Nombre ; ${user.mascota.nombre || 'No asignado'}\n` +
                          `➜ ㅤ ㅤ ﹟     Descripción ; ${petInfo.description}` 
                }, { quoted: m });
            } else {
                await sock.sendMessage(jid, { text: 'Parece que tienes una mascota de un tipo desconocido. Contacta a un administrador.' }, { quoted: m });
            }
        } else {
            await sock.sendMessage(jid, { text: 'Aún no tienes una mascota. Usa `.$mascota adoptar <tipo> [nombre]` para conseguir una.' }, { quoted: m });
        }
        return;
    }

    // Nuevo Subcomando "estado"
    if (subcomando === 'estado') {
        if (!user.mascota) {
            await sock.sendMessage(jid, { text: 'No tienes una mascota para revisar su estado. Usa `.$mascota adoptar <tipo> [nombre]` para conseguir una.' }, { quoted: m });
            return;
        }

        // --- Asegurar que las propiedades de la mascota sean números ---
        // Esto es crucial para evitar NaN si la mascota fue creada antes de estos campos.
        user.mascota.energia = typeof user.mascota.energia === 'number' ? user.mascota.energia : 100;
        user.mascota.felicidad = typeof user.mascota.felicidad === 'number' ? user.mascota.felicidad : 100;
        user.mascota.hambre = typeof user.mascota.hambre === 'number' ? user.mascota.hambre : 0;
        guardarEconomia(); // Guardar los cambios si se inicializaron

        const petInfo = PET_TYPES[user.mascota.tipo];
        const nombreMascota = user.mascota.nombre || petInfo.name;

        await sock.sendMessage(jid, {
            text: `⏝ ͝    𑄹   𝅄ㅤ   ㅤ *Estado de ${nombreMascota} (${petInfo.emoji})*\n\n` +
                  `➜ ㅤ ㅤ ﹟     Felicidad ; ${user.mascota.felicidad} / 100 ${user.mascota.felicidad > 75 ? '😊' : user.mascota.felicidad > 40 ? '😐' : '😞'}\n` +
                  `➜ ㅤ ㅤ ﹟     Energía ; ${user.mascota.energia} / 100 ${user.mascota.energia > 75 ? '⚡' : user.mascota.energia > 40 ? '🔋' : '💤'}\n` +
                  `➜ ㅤ ㅤ ﹟     Hambre ; ${user.mascota.hambre} / 100 ${user.mascota.hambre < 25 ? '🍖' : user.mascota.hambre < 60 ? '🤔' : ' stomachs'}\n\n` +
                  `_¡Mantén a tu mascota feliz, energizada y alimentada para sus aventuras!_`
        }, { quoted: m });
        return;
    }

    // Subcomando "adoptar"
    if (subcomando === 'adoptar') {
        if (user.mascota) {
            await sock.sendMessage(jid, { text: '¡Ya tienes un leal compañero! No puedes adoptar otra mascota por ahora.' }, { quoted: m });
            return;
        }

        const tipoMascota = args[1]?.toLowerCase();
        const nombreMascota = args.slice(2).join(' ');

        if (!tipoMascota) {
            await sock.sendMessage(jid, { text: `Para adoptar, especifica el tipo de mascota.
Ejemplo: \`$mascota adoptar perro Max\`

Usa \`$mascota tipos\` para ver la lista completa de mascotas disponibles.` }, { quoted: m });
            return;
        }

        const selectedPet = PET_TYPES[tipoMascota];

        if (!selectedPet) {
            await sock.sendMessage(jid, { text: `El tipo de mascota *'${tipoMascota}'* no es válido. Usa \`$mascota tipos\` para ver la lista completa de mascotas disponibles.` }, { quoted: m });
            return;
        }

        user.mascota = {
            tipo: tipoMascota,
            nombre: nombreMascota || null,
            // Inicializa estados básicos de la mascota
            energia: 100,
            felicidad: 100,
            hambre: 0, // Nueva propiedad para el hambre, inicializada en 0 (no hambriento)
            ultimaExpedicion: 0, // Nuevo timestamp para la expedición
        };
        guardarEconomia();
        await sock.sendMessage(jid, { text: `¡Felicidades! 🎉 Has adoptado un ${selectedPet.emoji} *${selectedPet.name}*` + (nombreMascota ? ` y lo has llamado *${nombreMascota}*` : '') + `.\n\n_Ahora es parte de tu aventura._` }, { quoted: m });
        return;
    }

    // Subcomando "nombre"
    if (subcomando === 'nombre') {
        if (!user.mascota) {
            await sock.sendMessage(jid, { text: 'No tienes una mascota para nombrarla. Usa `.$mascota adoptar <tipo> [nombre]` para conseguir una.' }, { quoted: m });
            return;
        }

        const nuevoNombre = args.slice(1).join(' ');

        if (!nuevoNombre) {
            await sock.sendMessage(jid, { text: 'Por favor, proporciona el nuevo nombre para tu mascota. Ejemplo: `.$mascota nombre Firulais`' }, { quoted: m });
            return;
        }

        user.mascota.nombre = nuevoNombre;
        guardarEconomia();
        const petInfo = PET_TYPES[user.mascota.tipo];
        await sock.sendMessage(jid, { text: `Has cambiado el nombre de tu ${petInfo.emoji} *${petInfo.name}* a *${nuevoNombre}*. ¡Qué nombre tan adecuado!` }, { quoted: m });
        return;
    }

    // Subcomando "liberar" (para eliminar la mascota)
    if (subcomando === 'liberar') {
        if (!user.mascota) {
            await sock.sendMessage(jid, { text: 'No tienes una mascota para liberar.' }, { quoted: m });
            return;
        }

        const petInfo = PET_TYPES[user.mascota.tipo];
        const nombreMascota = user.mascota.nombre ? ` *${user.mascota.nombre}*` : '';

        user.mascota = null;
        guardarEconomia();
        await sock.sendMessage(jid, { text: `Has liberado a tu ${petInfo.emoji} *${petInfo.name}*${nombreMascota}. ¡Esperamos que encuentre un buen hogar!` }, { quoted: m });
        return;
    }

    // Subcomando "expedicion" (implementado con lógica)
    if (subcomando === 'expedicion') {
        if (!user.mascota) {
            await sock.sendMessage(jid, { text: 'No tienes una mascota para enviar a una expedición.' }, { quoted: m });
            return;
        }

        // --- Asegurar que las propiedades de la mascota sean números antes de usarlas ---
        user.mascota.energia = typeof user.mascota.energia === 'number' ? user.mascota.energia : 100;
        user.mascota.felicidad = typeof user.mascota.felicidad === 'number' ? user.mascota.felicidad : 100;
        user.mascota.hambre = typeof user.mascota.hambre === 'number' ? user.mascota.hambre : 0;
        user.mascota.ultimaExpedicion = typeof user.mascota.ultimaExpedicion === 'number' ? user.mascota.ultimaExpedicion : 0;


        const petInfo = PET_TYPES[user.mascota.tipo];
        const nombreMascota = user.mascota.nombre || petInfo.name;
        const COSTO_ENERGIA_EXPEDICION = 20;
        const TIEMPO_RECARGA_EXPEDICION_MINUTOS = 30; // 30 minutos

        const ahora = Date.now();
        const tiempoDesdeUltimaExpedicion = ahora - user.mascota.ultimaExpedicion;
        const tiempoRestanteMs = (TIEMPO_RECARGA_EXPEDICION_MINUTOS * 60 * 1000) - tiempoDesdeUltimaExpedicion;

        if (tiempoRestanteMs > 0) {
            const minutosRestantes = Math.ceil(tiempoRestanteMs / (60 * 1000));
            await sock.sendMessage(jid, { text: `¡${nombreMascota} está cansado de su última expedición! Necesita descansar ${minutosRestantes} minutos más antes de otra.` }, { quoted: m });
            return;
        }

        if (user.mascota.energia < COSTO_ENERGIA_EXPEDICION) {
            await sock.sendMessage(jid, { text: `¡${nombreMascota} no tiene suficiente energía para ir de expedición! Necesita al menos ${COSTO_ENERGIA_EXPEDICION} de energía. Usa \`$mascota alimentar\` para recargarla.` }, { quoted: m });
            return;
        }
        
        // Simular éxito o fracaso y recompensas
        const exito = Math.random() < 0.7; // 70% de probabilidad de éxito
        const recompensa = Math.floor(Math.random() * 50) + 10; // entre 10 y 59 monedas
        const perdidaFelicidad = Math.floor(Math.random() * 10) + 5; // entre 5 y 14 de felicidad
        const aumentoHambre = Math.floor(Math.random() * 15) + 10; // entre 10 y 24 de hambre

        user.mascota.energia = Math.max(0, user.mascota.energia - COSTO_ENERGIA_EXPEDICION);
        user.mascota.felicidad = Math.max(0, user.mascota.felicidad - perdidaFelicidad);
        user.mascota.hambre = Math.min(100, user.mascota.hambre + aumentoHambre); // El hambre aumenta
        user.mascota.ultimaExpedicion = ahora; // Actualiza el timestamp de la última expedición

        let mensajeExpedicion = `⏝ ͝    𑄹   𝅄ㅤ   ㅤ Tu ${petInfo.emoji} *${nombreMascota}* ha regresado de su expedición.`;

        if (exito) {
            user.monedas = (user.monedas || 0) + recompensa; // Asumiendo que 'user.monedas' existe
            mensajeExpedicion += `\n🎉 ¡Tu mascota tuvo éxito y encontró *${recompensa} monedas*!`;
        } else {
            mensajeExpedicion += `\n😔 No encontró nada especial esta vez. ¡Mejor suerte la próxima!`;
        }

        mensajeExpedicion += `\n\n⏝ ͝    𑄹   𝅄ㅤ   ㅤ Sus estadísticas ahora son:\n` +
                            `➜ ㅤ ㅤ ﹟     Energía ; ${user.mascota.energia}\n` +
                            `➜ ㅤ ㅤ ﹟     Felicidad ; ${user.mascota.felicidad}\n` +
                            `➜ ㅤ ㅤ ﹟     Hambre ; ${user.mascota.hambre}`;
        
        guardarEconomia();
        await sock.sendMessage(jid, { text: mensajeExpedicion }, { quoted: m });
        return;
    }


    // Subcomando "jugar"
    if (subcomando === 'jugar') {
        if (!user.mascota) {
            await sock.sendMessage(jid, { text: 'No tienes una mascota para jugar con ella.' }, { quoted: m });
            return;
        }

        // --- Asegurar que las propiedades de la mascota sean números antes de usarlas ---
        user.mascota.energia = typeof user.mascota.energia === 'number' ? user.mascota.energia : 100;
        user.mascota.felicidad = typeof user.mascota.felicidad === 'number' ? user.mascota.felicidad : 100;
        user.mascota.hambre = typeof user.mascota.hambre === 'number' ? user.mascota.hambre : 0;


        const petInfo = PET_TYPES[user.mascota.tipo];
        const nombreMascota = user.mascota.nombre || petInfo.name;

        // Lógica de jugar
        const aumentoFelicidad = Math.floor(Math.random() * 15) + 10; // Aumenta 10-24 de felicidad
        const disminucionEnergia = Math.floor(Math.random() * 10) + 5; // Disminuye 5-14 de energía
        const aumentoHambre = Math.floor(Math.random() * 10) + 5; // Aumenta 5-14 de hambre

        user.mascota.felicidad = Math.min(100, user.mascota.felicidad + aumentoFelicidad);
        user.mascota.energia = Math.max(0, user.mascota.energia - disminucionEnergia);
        user.mascota.hambre = Math.min(100, user.mascota.hambre + aumentoHambre);

        guardarEconomia();
        await sock.sendMessage(jid, {
            text: `⏝ ͝    𑄹   𝅄ㅤ   ㅤ Has jugado con tu ${petInfo.emoji} *${nombreMascota}* ¡Parece más feliz!\n\n` +
                `⏝ ͝    𑄹   𝅄ㅤ   ㅤ Sus estadísticas ahora son:\n` +
                `➜ ㅤ ㅤ ﹟     Felicidad ; ${user.mascota.felicidad}\n` +
                `➜ ㅤ ㅤ ﹟     Energía ; ${user.mascota.energia}\n` +
                `➜ ㅤ ㅤ ﹟     Hambre ; ${user.mascota.hambre}`
        }, { quoted: m });
        return;
    }

    // Subcomando "alimentar"
    if (subcomando === 'alimentar') {
        if (!user.mascota) {
            await sock.sendMessage(jid, { text: 'No tienes una mascota para alimentar.' }, { quoted: m });
            return;
        }

        // --- Asegurar que las propiedades de la mascota sean números antes de usarlas ---
        user.mascota.energia = typeof user.mascota.energia === 'number' ? user.mascota.energia : 100;
        user.mascota.felicidad = typeof user.mascota.felicidad === 'number' ? user.mascota.felicidad : 100;
        user.mascota.hambre = typeof user.mascota.hambre === 'number' ? user.mascota.hambre : 0;


        const petInfo = PET_TYPES[user.mascota.tipo];
        const nombreMascota = user.mascota.nombre || petInfo.name;

        // Lógica de alimentar
        const aumentoEnergia = Math.floor(Math.random() * 25) + 15; // Aumenta 15-39 de energía
        const disminucionHambre = Math.floor(Math.random() * 30) + 20; // Disminuye 20-49 de hambre

        user.mascota.energia = Math.min(100, user.mascota.energia + aumentoEnergia);
        user.mascota.hambre = Math.max(0, user.mascota.hambre - disminucionHambre);

        guardarEconomia();
        await sock.sendMessage(jid, {
            text: `⏝ ͝    𑄹   𝅄ㅤ   ㅤ Has alimentado a tu ${petInfo.emoji} *${nombreMascota}* ¡Gracias por cuidarlo!\n\n` +
                `⏝ ͝    𑄹   𝅄ㅤ   ㅤ Sus estadísticas ahora son:\n` +
                `➜ ㅤ ㅤ ﹟     Energía ; ${user.mascota.energia}\n` +
                `➜ ㅤ ㅤ ﹟     Felicidad ; ${user.mascota.felicidad}\n` +
                `➜ ㅤ ㅤ ﹟     Hambre ; ${user.mascota.hambre}`
        }, { quoted: m });
        return;
    }


    // Mensaje de ayuda por defecto
    await sock.sendMessage(jid, {
        text: `ㅤㅤ ㅤֺ🪙⃟ֵ̈ㅤֺ 𝗠𝗔𝗦𝗖𝗢𝗧𝗔𝗦 ☆̸̷ᩧ Ꮺ

⏝ ͝   𑄹   𝅄ㅤ   ㅤ *$mascota info* — _Ve la información de tu mascota actual._
⏝ ͝   𑄹   𝅄ㅤ   ㅤ *$mascota estado* — _Revisa la felicidad, energía y hambre de tu mascota._
⏝ ͝   𑄹   𝅄ㅤ   ㅤ *$mascota adoptar <tipo> [nombre]* — _Adopta una nueva mascota y, opcionalmente, ponle un nombre._
⏝ ͝   𑄹   𝅄ㅤ   ㅤ *$mascota nombre <nuevo nombre>* — _Cambia el nombre de tu mascota actual._
⏝ ͝   𑄹   𝅄ㅤ   ㅤ *$mascota liberar* — _Libera a tu mascota (la pierdes para siempre)._
⏝ ͝   𑄹   𝅄ㅤ   ㅤ *$mascota tipos* — _Muestra la lista completa de mascotas disponibles para adoptar._
⏝ ͝   𑄹   𝅄ㅤ   ㅤ *$mascota expedicion* — _Envía a tu mascota a una nueva aventura para ganar recompensas (tiene tiempo de recarga)._
⏝ ͝   𑄹   𝅄ㅤ   ㅤ *$mascota jugar* — _Juega con tu mascota para aumentar su felicidad._
⏝ ͝   𑄹   𝅄ㅤ   ㅤ *$mascota alimentar* — _Alimenta a tu mascota para restaurar su energía y saciar su hambre._

⏝ ͝   𑄹   𝅄ㅤ   ㅤ Ejemplo: $mascota adoptar perro Max`
    }, { quoted: m });
};

export const config = {
    name: 'mascota',
    alias: ['pet', 'animal'],
    description: 'Gestiona tu mascota, desde adoptarla hasta interactuar con ella.',
    usage: '$mascota [subcomando] [args]',
    necesitaMetadata: false,
};