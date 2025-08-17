// comandos/tienda.js
import { tienda } from './tiendadata.js';

export default async (sock, m) => {
    // Mensaje de error si la tienda está vacía o no se carga correctamente
    if (!Array.isArray(tienda) || tienda.length === 0) {
        return sock.sendMessage(
            m.key.remoteJid,
            {
                text: '❌ *Error de la Tienda:*\n"Actualmente, la tienda del casino está vacía. Vuelve pronto para ver nuevas ofertas."'
            },
            { quoted: m }
        );
    }

    // Encabezado de la tienda con el nuevo formato
    let texto = 'ㅤㅤ  ꆭ   ㅤׂㅤ 🎰ᩨ  ㅤׅ      *𝗧𝗜𝗘𝗡𝗗𝗔*   ⠳     \n' +
                '⏝ ͝    𑄹   𝅄ㅤ   ㅤ Dividida en dos partes, en la tienda de nuestro casino podrás encontrar todo tipo de objetos con funciones tanto on como off rol.\n';

    // Definición de las categorías con sus nombres exactos del texto deseado
    const categorias = {
        '𝗢𝗡 𝗥𝗢𝗟 ; 𝗟𝗢𝗪 𝗖𝗢𝗦𝗧': [],
        '𝗢𝗡 𝗥𝗢𝗟 ; 𝗠𝗘𝗗𝗜𝗨𝗠 𝗖𝗢𝗦𝗧': [],
        '𝗢𝗡 𝗥𝗢𝗟 ; 𝗛𝗜𝗚𝗛 𝗖𝗢𝗦𝗧': [],
        '𝗢𝗙𝗙 𝗥𝗢𝗟 ; 𝗔𝗟𝗟 𝗖𝗢𝗦𝗧𝗦': []
    };

    // Asigna cada ítem a su categoría correspondiente
    tienda.forEach(item => {
        if (['alcohol', 'droga', 'rol-absurdo', 'somniferos', 'favor-adm'].includes(item.clave)) {
            categorias['𝗢𝗡 𝗥𝗢𝗟 ; 𝗟𝗢𝗪 𝗖𝗢𝗦𝗧'].push(item);
        } else if (['camaras', 'arma-blanca', 'veneno-nol', 'info-exclusiva', 'doble-personaje'].includes(item.clave)) {
            categorias['𝗢𝗡 𝗥𝗢𝗟 ; 𝗠𝗘𝗗𝗜𝗨𝗠 𝗖𝗢𝗦𝗧'].push(item);
        } else if (['arma-fuego', 'veneno-letal', 'inmunidad-muerte', 'escenario'].includes(item.clave)) {
            categorias['𝗢𝗡 𝗥𝗢𝗟 ; 𝗛𝗜𝗚𝗛 𝗖𝗢𝗦𝗧'].push(item);
        } else if (['nuevo-pj', 'actividad-semanal', 'trama', 'ausencia', 'salvacion'].includes(item.clave)) {
            categorias['𝗢𝗙𝗙 𝗥𝗢𝗟 ; 𝗔𝗟𝗟 𝗖𝗢𝗦𝗧𝗦'].push(item);
        }
    });

    // Construye el texto para cada categoría y sus ítems
    for (const categoria in categorias) {
        if (categorias[categoria].length > 0) {
            texto += `\n     · · ─────── · ⛁ · ─────── · ·\n`; // Separador entre categorías
            texto += `   ❚ ㅤ𓈒𓈒𓈒  *${categoria}*\n\n`; // Nombre de la categoría
            categorias[categoria].forEach(item => {
                // Formato de cada ítem: Nombre - Precio
                texto += `⛁  ۫  ִ ${item.nombre} ⎯  ${item.precio.toLocaleString('es-ES')}\n`; // toLocaleString para formato de moneda con comas
                // Descripción/clave del ítem en la siguiente línea
                texto += `⏝ ͝    𑄹   𝅄ㅤ   ㅤ ${item.clave}\n`;
            });
        }
    }

    // Pie de página de la tienda
    texto += '\n\nPara adquirir un objeto, usa: `$comprar [clave-del-objeto]`\n' +
             '¡Que la suerte esté de tu lado en el casino!';

    // URL de la imagen que quieres mostrar con el comando
    const imagenUrl = 'https://i.pinimg.com/736x/5d/26/8d/5d268d0a52276ff70db5c803f0dd0458.jpg';

    // Intenta enviar el mensaje con la imagen y el caption (texto)
    try {
        await sock.sendMessage(
            m.key.remoteJid,
            {
                image: { url: imagenUrl }, // Aquí se especifica la URL de la imagen
                caption: texto.trim(),   // El texto de la tienda como caption de la imagen
            },
            { quoted: m } // Responde al mensaje original
        );
    } catch (err) {
        // Manejo de errores si el envío falla
        console.error('❌ Error al mostrar la Tienda del Casino:', err);
        await sock.sendMessage(
            m.key.remoteJid,
            {
                text: '❌ *Error de la Tienda:*\n"¡Los engranajes del casino se han atascado! No pude mostrar la tienda en este momento. Intenta de nuevo más tarde."'
            },
            { quoted: m }
        );
    }
};