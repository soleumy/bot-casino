// comandos/usar.js
import { tienda } from './tiendadata.js';

export default async (sock, m, args, { user, guardarEconomia, jid }) => {
    // Accede directamente a user.inventario. index.mjs ya garantiza que exista.
    const inventario = user.inventario;

    // La entrada del usuario DEBE ser la clave del ítem (ej. "alcohol", "arma-fuego").
    // Unimos los argumentos con un guion bajo y los convertimos a minúsculas para coincidir con las claves.
    const itemKeyInput = args.join("-").toLowerCase();

    // Busca el ítem en el inventario del usuario por su CLAVE exacta
    // Se asume que user.inventario almacena las claves de los ítems.
    const itemInInventoryKey = inventario.find(i => i === itemKeyInput);

    if (!itemInInventoryKey) {
        return sock.sendMessage(jid, {
            text: '❌ *Error al usar el objeto:*\n"Ese objeto no se encuentra en tu inventario, o el código que usaste es incorrecto."\n\n_Revisa tus posesiones con: *$inventario* y usa el *código* (clave) exacto que aparece ahí._'
        }, { quoted: m });
    }

    // Encuentra el objeto completo del ítem en la tienda para obtener su nombre (para el mensaje de confirmación)
    const itemDetails = tienda.find(item => item.clave === itemInInventoryKey);

    if (!itemDetails) {
        // Esto no debería ocurrir si itemInInventoryKey fue encontrado en el inventario
        // y el inventario solo almacena claves válidas de la tienda.
        console.error(`Error: Clave de ítem "${itemInInventoryKey}" encontrada en inventario pero no en tiendadata.`);
        return sock.sendMessage(jid, {
            text: '❌ *Error interno del casino:*\n"Hubo un problema al identificar este objeto. Por favor, contacta a la administración para resolverlo."'
        }, { quoted: m });
    }

    // --- Objeto con las funciones de efecto para cada ítem (CLAVES y MENSAJES ACTUALIZADOS) ---
    const efectos = {
        // ON ROL ; LOW COST
        'alcohol': () => {
            // Efecto: El usuario se siente ebrio, para rol. Duración: 30 minutos.
            user.estados.ebrio = Date.now() + 30 * 60 * 1000;
            return '🍷 Has consumido alcohol. La cabeza te da vueltas, pero quizás la suerte te sonría en las mesas de juego...';
        },
        'droga': () => {
            // Efecto: El usuario se siente eufórico, para rol. Duración: 15 minutos.
            user.estados.euforico = Date.now() + 15 * 60 * 1000;
            return '💨 Una sensación extraña te recorre. La realidad se distorsiona por un momento. (Efecto no letal y de un solo uso en rol).';
        },
        'rol-absurdo': () => {
            // Efecto: Canje para que la administración cree un escenario absurdo.
            return '🎭 Has canjeado un "Escenario Absurdo". La administración ha sido notificada para preparar una sorpresa hilarante para el grupo. ¡Prepárense para lo inesperado en su próximo rol!';
        },
        'somniferos': () => {
            // Efecto: El usuario siente somnolencia, para rol. Duración: 1 minuto.
            user.estados.somnoliento = Date.now() + 1 * 60 * 1000;
            return '😴 Los somníferos hacen efecto. Sientes un cansancio abrumador. ¡Ideal para escapar o hacer dormir a alguien más en rol!';
        },
        'favor-adm': () => {
            // Efecto: Otorga un token de favor de administración. No se elimina del inventario si es una "propiedad".
            if (!user.propiedades) user.propiedades = [];
            if (!user.propiedades.includes('token-favor-adm')) {
                user.propiedades.push('token-favor-adm');
                // IMPORTANTE: Este ítem no se elimina del inventario automáticamente al usarlo,
                // ya que representa un "token" que se debe presentar a un admin.
                // Se elimina manualmente cuando el admin lo canjee.
                return '🎫 Has adquirido un *Token de Favor de Administración*. Contacta al staff para canjear tu pequeño privilegio cuando lo necesites.';
            }
            return '⛔ Ya posees un Token de Favor de Administración. Úsalo antes de intentar adquirir otro.';
        },

        // ON ROL ; MEDIUM COST
        'camaras': () => {
            // Efecto: Acceso a cámaras. Se reduce el contador de usos. El ítem se elimina del inventario
            // cuando el contador llega a 0 (esto debería gestionarse en una función general de usos o en el comando mismo).
            if (!user.estados.usosCamaras) user.estados.usosCamaras = 3; // Inicializa si no existe
            if (user.estados.usosCamaras > 0) {
                user.estados.usosCamaras--;
                return `📹 Has activado el acceso a las cámaras del casino. Te quedan ${user.estados.usosCamaras} usos restantes. ¡Vigila tus movimientos o los de otros!`;
            }
            // Si llega aquí, significa que el item está en el inventario pero sus usos ya se agotaron.
            // Deberías considerar remover el ítem del inventario automáticamente cuando los usos llegan a 0.
            return '⛔ Ya no te quedan usos para acceder a las cámaras. El sistema de vigilancia te ha detectado.';
        },
        'arma-blanca': () => {
            // Efecto: Otorga la propiedad de tener un arma blanca.
            if (!user.armas) user.armas = [];
            if (!user.armas.includes('arma-blanca')) {
                user.armas.push('arma-blanca');
                return '🔪 Has conseguido un *Arma Blanca*. Perfecta para un encuentro cercano inesperado o para un "ajuste de cuentas".';
            }
            return '⛔ Ya posees un arma blanca en tu arsenal. ¿Acaso necesitas más para sentirte seguro en este casino?';
        },
        'veneno-nol': () => { // Clave actualizada de 'veneno' a 'veneno-nol'
            // Efecto: El usuario tiene acceso a veneno no letal para rol. Duración: 30 minutos.
            user.estados.envenenadoNoLetal = Date.now() + 30 * 60 * 1000;
            return '🧪 Un frasco de *Veneno No Letal*. Úsalo sabiamente para inhabilitar a tus rivales sin consecuencias fatales en rol. ¡Nadie sospechará!';
        },
        'info-exclusiva': () => {
            // Efecto: La administración proporcionará información exclusiva.
            return '🤫 Has canjeado *Información Exclusiva*. La administración te contactará en privado para revelarte un secreto crucial de la trama. ¡Úsala con discreción, la información es poder en este lugar!';
        },
        'doble-personaje': () => {
            // Efecto: Otorga la habilidad de tener un doble personaje.
            if (!user.propiedades) user.propiedades = [];
            if (!user.propiedades.includes('doble-personaje')) {
                user.propiedades.push('doble-personaje');
                return '👥 ¡Felicidades! Ahora tienes la habilidad de controlar un *Doble Personaje* en la trama. Contacta al staff para los detalles y la creación de tu nueva identidad.';
            }
            return '⛔ Ya tienes la habilidad de un doble personaje. ¡No seas codicioso, con uno ya es suficiente para el caos!';
        },

        // ON ROL ; HIGH COST
        'arma-fuego': () => {
            // Efecto: Otorga la propiedad de tener un arma de fuego.
            if (!user.armas) user.armas = [];
            if (!user.armas.includes('arma-fuego')) {
                user.armas.push('arma-fuego');
                return '🔫 Te has hecho con un *Arma de Fuego*. El poder de cambiar drásticamente el juego está en tus manos. ¡Úsala con cabeza, aquí las balas tienen consecuencias!';
            }
            return '⛔ Ya posees un arma de fuego. No necesitas otra para sembrar el caos.';
        },
        'veneno-letal': () => {
            // Efecto: Acceso a veneno letal para rol.
            return '💀 Has adquirido *Veneno Letal*. Esto es para las situaciones donde no hay vuelta atrás. ¡La administración te contactará para supervisar su uso en rol, las muertes son serias en este casino!';
        },
        'inmunidad-muerte': () => {
            // Efecto: Proporciona una única inmunidad a la muerte.
            if (!user.estados.inmunidadMuerteUsos) user.estados.inmunidadMuerteUsos = 1;
            if (user.estados.inmunidadMuerteUsos > 0) {
                user.estados.inmunidadMuerteUsos--;
                user.estados.inmuneAMuerte = true; // Esto es un flag, la lógica de duración y reset debe ser gestionada por tu sistema principal (index.mjs).
                return '🛡️ Te has vuelto *Inmune a la Muerte* por una vez. La próxima vez que debieras morir en rol, escaparás milagrosamente. ¡Felicidades, has engañado al destino!';
            }
            return '⛔ Ya has usado tu inmunidad a la muerte. El destino final te espera sin excepciones.';
        },
        'escenario': () => {
            // Efecto: Obligar un escenario a otra persona.
            return '🃏 Has obtenido el poder de obligar un *Escenario* a otro jugador. Contacta a la administración para coordinar este giro en la trama. ¡El caos te llama y ahora puedes dirigirlo!';
        },

        // OFF ROL ; ALL COSTS
        'nuevo-pj': () => {
            // Efecto: Solicitar cambio de personaje.
            return '🔄 Has solicitado un *Cambio de Personaje*. Contacta a la administración para iniciar el proceso de creación de tu nueva identidad en el casino.';
        },
        'actividad-semanal': () => {
            // Efecto: Elegir actividad semanal.
            return '🗓️ Has ganado el derecho a *Elegir la Actividad Semanal*. Contacta a la administración para proponer tu idea. ¡Haz que la próxima semana sea memorable para todos en el casino!';
        },
        'trama': () => {
            // Efecto: Influenciar la trama del grupo.
            return '✍️ Has ganado la influencia para alterar la *Trama del Grupo*. Contacta a la administración para discutir tu impacto. ¡Tu mano puede moldear el destino de esta ciudad!';
        },
        'ausencia': () => {
            // Efecto: Derecho a ausencia prolongada.
            if (!user.propiedades) user.propiedades = [];
            if (!user.propiedades.includes('derecho-ausencia')) {
                user.propiedades.push('derecho-ausencia');
                return '✈️ Has asegurado tu *Derecho de Ausencia Prolongada sin Sanción*. Notifica a la administración cuando vayas a tomar un descanso del juego.';
            }
            return '⛔ Ya tienes un derecho de ausencia activa. Disfruta tu descanso, sin preocupaciones.';
        },
        'salvacion': () => {
            // Efecto: Proporciona una única salvación de eliminación.
            if (!user.estados.salvacionUsos) user.estados.salvacionUsos = 1;
            if (user.estados.salvacionUsos > 0) {
                user.estados.salvacionUsos--;
                return '🆘 Has adquirido una *Salvación de Eliminación*. Esta te librará de ser eliminado del juego una vez. ¡Un as bajo la manga para las situaciones más peligrosas!';
            }
            return '⛔ Ya has usado tu salvación de eliminación. Tus vidas en el juego están contadas.';
        }
    };

    // --- Lógica para eliminar el ítem del inventario después de usarlo ---
    // Algunos ítems son de "un solo uso" y desaparecen. Otros otorgan "propiedades" y no desaparecen.
    const itemsDeUnSoloUso = [
        'alcohol', 'droga', 'rol-absurdo', 'somniferos',
        'veneno-nol', 'info-exclusiva', 'veneno-letal', 'escenario',
        'nuevo-pj', 'actividad-semanal', 'trama',
        // 'camaras', 'inmunidad-muerte', 'salvacion' se gestionan sus usos dentro del efecto y se eliminarían
        // cuando el contador interno de usos llegue a 0 (ej. si `usosCamaras` llega a 0, entonces se remueve el ítem 'camaras' del inventario)
        // Por simplicidad, los items con usos limitados no se remueven de inmediato del inventario aquí.
        // La lógica de eliminación final cuando los usos son 0 debería estar en tu sistema principal.
    ];

    // Para los ítems con contador, el ítem se mantiene en el inventario hasta que sus usos se agoten.
    // Esto significa que NO se elimina automáticamente aquí para:
    // 'camaras', 'inmunidad-muerte', 'salvacion'
    // Los ítems que otorgan una "propiedad" permanente tampoco se eliminan:
    // 'favor-adm', 'arma-blanca', 'doble-personaje', 'arma-fuego', 'ausencia'

    // Ejecuta el efecto correspondiente a la clave del ítem
    const efectoFuncion = efectos[itemInInventoryKey];
    let resultadoMensaje;

    if (efectoFuncion) {
        resultadoMensaje = efectoFuncion();

        // Si el ítem es de un solo uso, lo removemos del inventario.
        // Excluimos aquellos que tienen usos limitados o que otorgan una propiedad.
        if (itemsDeUnSoloUso.includes(itemInInventoryKey)) {
            const indexToRemove = inventario.findIndex(i => i === itemInInventoryKey);
            if (indexToRemove !== -1) {
                user.inventario.splice(indexToRemove, 1);
            }
        }
        // Nota: Para 'camaras', 'inmunidad-muerte', 'salvacion', etc., la eliminación del inventario
        // debería ocurrir cuando *sus usos internos* lleguen a 0, lo cual es mejor gestionar
        // en una función de mantenimiento o en el código que revise esos estados.
        // Aquí solo se reduce el contador.

    } else {
        resultadoMensaje = '✨ Has usado un objeto misterioso, pero su poder aún no se revela. Tal vez el casino guarda sus secretos celosamente...';
    }

    // Marcar cambios para guardar la economía
    guardarEconomia();

    // Envía el mensaje de confirmación
    return sock.sendMessage(jid, {
        text: `✅ Has usado: *${itemDetails.nombre}* (${itemInInventoryKey}).\n\n${resultadoMensaje}`
    }, { quoted: m });
};