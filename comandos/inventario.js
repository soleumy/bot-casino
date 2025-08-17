// comandos/inventario.js
import { tienda } from './tiendadata.js';

export default async (sock, m, args, { user, db, jid, remitente, isGroup, chatConfig }) => {
    // Verificar si el bot está activo en este chat
    if (chatConfig.activo === false) {
        return sock.sendMessage(jid, { text: '◇ 𝗖𝖱𝖴𝖯𝗜𝗘𝗥 ◇\n"La sala de apuestas está cerrada en este momento. Usa *$activar* para reabrirla."' }, { quoted: m });
    }

    let targetUserJid;
    let targetUserData;

    // Determinar si se está mencionando a alguien o es el propio remitente
    const mentionedJid = m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];

    if (mentionedJid) {
        targetUserJid = mentionedJid;
        // Acceder a los datos del usuario mencionado desde la estructura correcta
        if (isGroup) {
            db[jid] ??= { users: {} }; // Asegura el objeto del grupo si no existe
            db[jid].users ??= {}; // Asegura el objeto de usuarios dentro del grupo
            targetUserData = db[jid].users[targetUserJid];
        } else {
            // En un chat privado, si se menciona a alguien (que sería a sí mismo),
            // se usarán los datos del 'user' actual, que es el remitente.
            targetUserData = user; 
            targetUserJid = remitente; // Redirigir al remitente en chat privado si se auto-menciona
        }

        // Si el usuario mencionado no existe o no tiene datos
        if (!targetUserData) {
            return sock.sendMessage(jid, { text: `◇ 𝗖𝖱𝖴𝖯𝗜𝗘𝗥 ◇\n"Parece que @${targetUserJid.split('@')[0]} no ha registrado su ficha en el Casino. Su bóveda está vacía."` }, { quoted: m, mentions: [targetUserJid] });
        }
    } else {
        // Si no hay mención, es el inventario del remitente del mensaje
        targetUserJid = remitente;
        targetUserData = user; // 'user' ya es el objeto de datos del remitente, pasado por index.mjs
    }

    // Accede a las propiedades del usuario objetivo
    const inventario = targetUserData.inventario || [];
    const propiedades = targetUserData.propiedades || [];
    const titulos = targetUserData.titulos || [];

    // Organiza los items del inventario por categoría
    const itemsPorCategoria = {};
    inventario.forEach(itemNombre => { 
        const dato = tienda.find(i => i.nombre === itemNombre);
        // Asegurarse de que la categoría esté capitalizada correctamente
        const categoria = (dato?.categoria || 'otros').charAt(0).toUpperCase() + (dato?.categoria || 'otros').slice(1);
        const emoji = dato?.emoji || '📦'; // Mantener emoji genérico si no hay uno específico

        itemsPorCategoria[categoria] ??= { emoji, items: [] };
        itemsPorCategoria[categoria].items.push(itemNombre);
    });

    // Construye el texto a enviar con la temática del casino
    let texto = `◇ 𝗖𝖱𝖴𝖯𝗜𝗘𝗥 ◇\n\n🔒 *La Bóveda de @${targetUserJid.split('@')[0]} revela sus activos:*\n\n`;

    if (inventario.length === 0) {
        texto += '*Crupier informa:*\n"El registro de esta bóveda está vacío. Si buscas artículos exclusivos, pregunta por *$tienda* y *$comprar* para adquirir algo de valor."';
    } else {
        // Ordena las categorías para una presentación más consistente
        const categoriasOrdenadas = Object.keys(itemsPorCategoria).sort((a, b) => {
            if (a === 'Otros') return 1; // "Otros" al final
            if (b === 'Otros') return -1;
            return a.localeCompare(b);
        });

        for (const categoria of categoriasOrdenadas) {
            const data = itemsPorCategoria[categoria];
            texto += `\n${data.emoji} *${categoria}* (_Colección de ${categoria}_):\n`; 
            // Cuenta la frecuencia de cada ítem en esta categoría
            const cuentaItems = {};
            data.items.forEach(item => {
                cuentaItems[item] = (cuentaItems[item] || 0) + 1;
            });
            let index = 1;
            for (const item in cuentaItems) {
                texto += ` ${index}. ${item} (x${cuentaItems[item]})\n`;
                index++;
            }
        }
    }

    if (propiedades.length > 0) {
        texto += `\n\n🏛️ *Propiedades de Lujo en posesión:*\n${propiedades.map((p, i) => ` ${i + 1}. ${p}`).join('\n')}`;
    }

    if (titulos.length > 0) {
        texto += `\n\n👑 *Títulos de Honor y Reconocimientos:*\n${titulos.map((t, i) => ` ${i + 1}. ${t}`).join('\n')}`;
    }
    
    texto += `\n\n_Cada artículo en la bóveda, cada propiedad adquirida, cada título ganado... son la prueba de tu estatus en el mundo de las apuestas._`;

    // Envía el mensaje con mención al usuario
    await sock.sendMessage(jid, {
        text: texto.trim(),
        mentions: [targetUserJid]
    }, { quoted: m });
};

export const config = {
    name: 'boveda', // Cambiado a 'boveda'
    alias: ['vault', 'inventario', 'items', 'coleccion'], // Añadido 'inventario' como alias
    description: 'Permite al Crupier revelar los artículos, propiedades y títulos que un jugador ha acumulado en el Casino.', // Descripción actualizada
    usage: '$boveda [@mención]',
    necesitaMetadata: false, 
};