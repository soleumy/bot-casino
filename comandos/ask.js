// comandos/ask.js
import { GoogleGenerativeAI } from '@google/generative-ai';

// Inicializa el cliente de Google Gemini.
// Usará la API Key de la variable de entorno GEMINI_API_KEY.
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Selecciona el modelo de Gemini que quieres usar.
// 'gemini-1.5-flash' es una buena elección para texto, balanceando velocidad y capacidad.
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
// Opcional: si gemini-1.5-flash no funciona, intenta con el siguiente:
// const model = genAI.getGenerativeModel({ model: "gemini-1.0-pro" });

/**
 * Manejador para el comando $ask. Permite a los usuarios interactuar con Google Gemini.
 * @param {import('@whiskeysockets/baileys').WASocket} sock - El socket de Baileys.
 * @param {import('@whiskeysockets/baileys').WAMessage} m - El objeto del mensaje.
 * @param {string[]} args - Argumentos del comando (el texto de la pregunta).
 * @param {object} extra - Objeto con datos adicionales pasados desde index.mjs.
 * @param {string} extra.jid - El JID del chat actual.
 */
export default async function askHandler(sock, m, args, extra) {
    const { jid } = extra;
    const prompt = args.join(' ').trim(); // Une todos los argumentos para formar la pregunta.

    if (!prompt) {
        return sock.sendMessage(jid, { text: '💬 *Bot AI:*\n"Por favor, hazme una pregunta. Ejemplo: *$ask ¿Cuál es la capital de Francia?*"' }, { quoted: m });
    }

    // Indicador de "escribiendo..."
    await sock.sendPresenceUpdate('composing', jid);

    try {
        // Inicia una conversación con el modelo de Gemini.
        const chat = model.startChat({
            history: [
                // Puedes añadir un historial inicial aquí si quieres un "pre-contexto" para el bot
                { role: "model", parts: [{ text: "Soy una IA, lista para ayudarte." }] }, // Mensaje de contexto neutral
            ],
            generationConfig: {
                maxOutputTokens: 300, // Limita la longitud de la respuesta.
                temperature: 0.7, // Controla la fluidez y creatividad.
            },
        });

        // Envía el mensaje del usuario al modelo
        const result = await chat.sendMessage(prompt);
        const response = await result.response;
        const respuestaIA = response.text(); // Obtiene el texto de la respuesta

        if (respuestaIA) {
            await sock.sendMessage(jid, { text: `🤖 *Respuesta de la IA:*\n\n${respuestaIA}` }, { quoted: m });
        } else {
            await sock.sendMessage(jid, { text: '❌ No pude encontrar una respuesta clara. Intenta reformular tu pregunta.' }, { quoted: m });
        }

    } catch (error) {
        console.error('❌ Error al comunicarse con Google Gemini:', error);
        // Manejo de errores específicos
        if (error.message.includes('API_KEY_INVALID') || error.message.includes('API key not valid')) {
            await sock.sendMessage(jid, { text: '❌ Error de conexión con la IA. La clave API de Gemini no es válida o está ausente. Consulta al administrador.' }, { quoted: m });
        } else if (error.message.includes('Resource has been exhausted')) { // Error de cuota agotada
            await sock.sendMessage(jid, { text: '⚠️ Las solicitudes a la IA se han agotado por ahora. Por favor, intenta de nuevo más tarde.' }, { quoted: m });
        } else if (error.message.includes('models/gemini-pro is not found') || error.message.includes('not supported for generateContent')) {
            await sock.sendMessage(jid, { text: '🚫 El bot no puede conectar con el modelo de IA solicitado. Asegúrate de que el modelo configurado (ej. `gemini-1.5-flash` o `gemini-1.0-pro`) está disponible para tu API Key.' }, { quoted: m });
        } else {
            await sock.sendMessage(jid, { text: '❌ Ocurrió un error inesperado al procesar tu solicitud. Por favor, intenta de nuevo más tarde.' }, { quoted: m });
        }
    } finally {
        // Detener el indicador de "escribiendo..."
        await sock.sendPresenceUpdate('paused', jid);
    }
}

// Configuración del comando
export const config = {
    name: 'ask',
    alias: ['preguntaai', 'ai'],
    description: 'Permite hacer preguntas a una Inteligencia Artificial (Google Gemini) y obtener respuestas.',
    usage: '$ask <tu pregunta>',
    necesitaMetadata: false, // No necesita metadatos del grupo para este comando
};