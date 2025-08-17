// index.mjs
import baileys from '@whiskeysockets/baileys';
import pino from 'pino';
import qrcode from 'qrcode-terminal';
import { readdir, readFile, writeFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { Boom } from '@hapi/boom';
import fs from 'fs';
import { execSync } from 'child_process';
import readline from 'readline';

// Importa las funciones de manejo de eventos de bienvenida y despedida
import { manejarGrupoUpdate } from './comandos/bienvenida.js';
import { manejarGrupoUpdateDespedida } from './comandos/despedida.js';

const {
    makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
    isJidGroup,
    extractMessageContent,
    jidNormalizedUser
} = baileys;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const tempDir = path.join(__dirname, 'temp');
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

const comandos = new Map();
const dbPath = path.join(__dirname, 'economia.json');
// Ruta al archivo matrimonio.json dentro de la carpeta 'database'
const matrimonioPath = path.join(__dirname, 'database', 'matrimonio.json');

let economiaGlobal = {};
let matrimoniosGlobal = {};
let cambiosPendientes = false;
let saveTimeout = null;

let botJid = '';

const urlRegex = /(https?:\/\/[^\s]+)|(www\.[^\s]+)/g;

const cargarJsonSeguro = async (ruta, valorPorDefecto = {}) => {
    try {
        if (!fs.existsSync(ruta)) {
            const dir = path.dirname(ruta);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            await writeFile(ruta, JSON.stringify(valorPorDefecto, null, 2));
            return valorPorDefecto;
        }
        const data = await readFile(ruta, 'utf8');
        return JSON.parse(data);
    } catch (e) {
        console.error(`❌ Error al cargar ${ruta}. Se restablecerá a los valores por defecto.`, e);
        const dir = path.dirname(ruta);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        await writeFile(ruta, JSON.stringify(valorPorDefecto, null, 2));
        return valorPorDefecto;
    }
};

const guardarDatos = () => {
    if (saveTimeout) {
        clearTimeout(saveTimeout);
    }

    saveTimeout = setTimeout(async () => {
        try {
            if (cambiosPendientes) {
                await writeFile(dbPath, JSON.stringify(economiaGlobal, null, 2));
                await writeFile(matrimonioPath, JSON.stringify(matrimoniosGlobal, null, 2));
                cambiosPendientes = false;
                console.log('💾 Datos guardados correctamente.');
            }
        } catch (e) {
            console.error('❌ Error al guardar los datos:', e);
        } finally {
            saveTimeout = null;
        }
    }, 2000);
};

const marcarCambiosParaGuardar = () => {
    cambiosPendientes = true;
    guardarDatos();
};

const inicializarUsuario = () => ({
    dinero: 0,
    banco: 0,
    inventario: [],
    personajes: [],
    energia: 100,
    fuerza: 0,
    estados: {},
    titulos: [],
    propiedades: [],
    mensajes: 0,
    experiencia: 0,
    nivel: 1,
    ultimaRecuperacion: Date.now(),
    ultimaAccion: 0,
    ultimaPesca: 0,
    ultimoJuego: 0,
    mascota: null
});

const obtenerDatosDelChat = (chatJid, userJid, isGroup) => {
    const containerKey = chatJid;

    if (!economiaGlobal[containerKey]) {
        economiaGlobal[containerKey] = {};
    }

    economiaGlobal[containerKey].config ??= {};
    economiaGlobal[containerKey].config.bienvenida ??= { activa: false, mensaje: '👋 ¡Bienvenido/a @usuario a este hermoso santuario!' };
    economiaGlobal[containerKey].config.despedida ??= { activa: false, mensaje: '👋 @usuario ha partido de nuestro santuario.' };
    economiaGlobal[containerKey].config.antilinkEnabled ??= false;
    economiaGlobal[containerKey].config.activo ??= true;

    economiaGlobal[containerKey].users ??= {};

    const normalizedUserJid = jidNormalizedUser(userJid);

    if (!economiaGlobal[containerKey].users[normalizedUserJid]) {
        economiaGlobal[containerKey].users[normalizedUserJid] = inicializarUsuario();
        marcarCambiosParaGuardar();
    }

    economiaGlobal[containerKey].users[normalizedUserJid].mensajes += 1;
    marcarCambiosParaGuardar();

    return economiaGlobal[containerKey].users[normalizedUserJid];
};


const cargarComandos = async () => {
    const comandosDir = path.join(__dirname, 'comandos');
    try {
        const archivos = (await readdir(comandosDir)).filter(a => a.endsWith('.js'));
        console.log(`🔎 Encontrados ${archivos.length} archivos de comandos.`);

        await Promise.all(archivos.map(async archivo => {
            try {
                const modulePath = `file://${path.join(comandosDir, archivo)}?update=${Date.now()}`;
                const modulo = await import(modulePath);
                const nombre = modulo.config?.name || archivo.replace('.js', '');
                comandos.set(nombre, { handler: modulo.default || modulo, config: modulo.config || {} });
                if (modulo.config?.alias && Array.isArray(modulo.config.alias)) {
                    modulo.config.alias.forEach(alias => {
                        comandos.set(alias, { handler: modulo.default || modulo, config: modulo.config || {} });
                    });
                }
                console.log(`✅ Comando cargado: $${nombre}${modulo.config?.alias ? ` (alias: $${modulo.config.alias.join(', $')})` : ''}`);
            } catch (e) {
                console.error(`❌ Error al cargar el comando "${archivo}":`, e);
            }
        }));
        console.log(`📊 Total de comandos cargados: ${comandos.size}`);
        if (comandos.size === 0) {
            console.warn('⚠️ No se cargó ningún comando. Asegúrate de que los archivos .js estén en la carpeta "comandos" y exporten un default.');
        }
    } catch (err) {
        console.error(`❌ Error al leer el directorio de comandos "${comandosDir}":`, err);
        console.error('Asegúrate de que la carpeta "comandos" exista en la misma ubicación que index.mjs');
    }
};

let socketGlobal;

const iniciarConexion = async () => {
    await cargarComandos();
    economiaGlobal = await cargarJsonSeguro(dbPath, {});
    matrimoniosGlobal = await cargarJsonSeguro(matrimonioPath, {});
    console.log('✅ Bases de datos de economía y matrimonios cargadas.');
    // AÑADE ESTO para depuración
    console.log('DEBUG (index.mjs): Contenido de matrimoniosGlobal al iniciar:', JSON.stringify(matrimoniosGlobal, null, 2));


    const { state, saveCreds } = await useMultiFileAuthState(path.join(__dirname, 'auth'));
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        auth: state,
        logger: pino({ level: 'silent' }),
        browser: ['Ubuntu', 'Chrome', '22.04.4']
    });

    socketGlobal = sock;

    sock.ev.on('connection.update', ({ connection, lastDisconnect, qr }) => {
        if (qr) {
            console.log('\n📱 Escanea este QR con WhatsApp:\n');
            qrcode.generate(qr, { small: true });
        }

        if (connection === 'close') {
            const code = lastDisconnect?.error?.output?.statusCode;
            console.log('📴 Conexión cerrada. Código:', code);

            if (code !== DisconnectReason.loggedOut) {
                console.log('🔁 Reintentando conexión...');
                setTimeout(iniciarConexion, 3000);
            } else {
                console.log('🚪 Sesión cerrada. Por favor, elimina la carpeta "auth" y reinicia el bot para escanear el código QR nuevamente.');
            }
        }

        if (connection === 'open') {
            console.log('✅ Bot conectado correctamente.');
            botJid = jidNormalizedUser(sock.user.id);
            console.log(`Bot JID: ${botJid}`);
        }
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('group-participants.update', async ({ id: groupJid, participants, action }) => {
        economiaGlobal[groupJid] ??= { users: {}, config: {} };
        economiaGlobal[groupJid].users ??= {};

        economiaGlobal[groupJid].config ??= {};
        economiaGlobal[groupJid].config.bienvenida ??= { activa: false, mensaje: '👋 ¡Bienvenido/a @usuario a este hermoso santuario!' };
        economiaGlobal[groupJid].config.despedida ??= { activa: false, mensaje: '👋 @usuario ha partido de nuestro santuario.' };

        for (const userJid of participants) {
            const normalizedUserJid = jidNormalizedUser(userJid);
            if (!economiaGlobal[groupJid].users[normalizedUserJid]) {
                economiaGlobal[groupJid].users[normalizedUserJid] = inicializarUsuario();
                marcarCambiosParaGuardar();
            }
        }

        if (action === 'add') {
            await manejarGrupoUpdate({
                sock: sock,
                update: { id: groupJid, participants, action },
                db: economiaGlobal,
                botJid: botJid
            });
        }

        if (action === 'remove') {
            await manejarGrupoUpdateDespedida({
                sock: sock,
                update: { id: groupJid, participants, action },
                db: economiaGlobal,
                botJid: botJid
            });
        }
    });

    sock.ev.on('messages.upsert', async ({ messages }) => {
        const m = messages[0];

        if (!m?.message) {
            return;
        }

        const jid = m.key.remoteJid;
        const remitente = jidNormalizedUser(m.key.participant || m.key.remoteJid);
        const messageContent = extractMessageContent(m.message);
        const text = messageContent?.conversation || messageContent?.extendedTextMessage?.text || messageContent?.imageMessage?.caption || messageContent?.videoMessage?.caption || '';

        const isGroup = typeof jid === 'string' ? isJidGroup(jid) : false;
        const isBot = remitente === botJid;

        if (!text.startsWith('$')) {
            return;
        }

        console.log('\n--- Comando Recibido ---');
        console.log('Objeto m (parcial):', { key: m.key, message: m.message });
        console.log(`Chat JID: ${jid}`);
        console.log(`Remitente JID: ${remitente}`);
        console.log(`Texto del mensaje: "${text}"`);
        console.log(`¿Es Grupo?: ${isGroup}`);
        console.log(`¿Es el Bot?: ${isBot}`);

        const [cmdRaw, ...args] = text.trim().split(/\s+/);
        const cmd = cmdRaw.slice(1).toLowerCase();

        // Comandos que siempre funcionan, independientemente del estado 'activo' del bot
        // Incluye "desactivar" para que siempre sea accesible.
        const alwaysActiveCommands = ['activar', 'desactivar', 'help', 'ayuda'];

        const user = obtenerDatosDelChat(jid, remitente, isGroup);
        const chatConfig = economiaGlobal[jid]?.config || {};

        // === LÓGICA PARA EL ESTADO ACTIVO DEL BOT ===
        // Si el bot está en un grupo, está inactivo (chatConfig.activo === false)
        // Y el comando NO es uno de los comandos que siempre deben funcionar,
        // entonces el bot no procesa el comando y envía un mensaje.
        if (isGroup && chatConfig.activo === false && !alwaysActiveCommands.includes(cmd)) {
            console.log(`⛔ Bot desactivado en el grupo ${jid}. Comando $${cmd} ignorado.`);
            await sock.sendMessage(jid, { text: `🔒 El bot está desactivado en este grupo. Usa *$activar* para reactivarlo.` });
            return; // Detiene el procesamiento si el bot está inactivo y el comando no está permitido
        }
        // === FIN DE LA LÓGICA ===

        // Anti-link logic (can be placed before or after active check, depending on desired behavior)
        if (isGroup && !isBot && chatConfig.antilinkEnabled) {
            let groupMetadata, botIsAdmin = false;
            try {
                groupMetadata = await sock.groupMetadata(jid);
                const botParticipant = groupMetadata.participants.find(p => jidNormalizedUser(p.id) === botJid);
                botIsAdmin = botParticipant && (botParticipant.admin === 'admin' || botParticipant.admin === 'superadmin');
                console.log(`AntiLink: Bot es Admin en ${jid}? ${botIsAdmin}`);
            } catch (error) {
                console.error(`Error obteniendo metadatos del grupo ${jid} para AntiLink:`, error);
            }

            if (botIsAdmin) {
                if (urlRegex.test(text)) {
                    console.log(`🔗 Link detectado de ${remitente} en ${jid}. Eliminando mensaje...`);
                    try {
                        await sock.sendMessage(jid, { delete: m.key });
                        await sock.sendMessage(jid, { text: `🚫 @${remitente.split('@')[0]}, los enlaces no están permitidos aquí.` }, { mentions: [remitente] });
                    } catch (error) {
                        console.error('❌ Error al eliminar mensaje con enlace:', error);
                    }
                    return;
                }
            }
        }
        
        // Ahora, obtén la entrada del comando después de todas las comprobaciones previas
        const commandEntry = comandos.get(cmd);

        console.log(`Comando extraído (raw): "${cmdRaw}"`);
        console.log(`Comando limpio (minúsculas): "${cmd}"`);
        console.log(`Args:`, args);
        console.log(`¿Comando encontrado en el mapa?: ${comandos.has(cmd)}`);

        if (!commandEntry || typeof commandEntry.handler !== 'function') {
            console.warn(`⚠️ Comando $${cmd} no encontrado o no válido.`);
            await sock.sendMessage(jid, { text: `❌ El comando *$${cmd}* no existe. Usa *$help* para ver los comandos disponibles.` });
            return;
        }

        try {
            const extra = {
                sock,
                db: economiaGlobal,
                user: user,
                remitente,
                jid,
                matrimonies: matrimoniosGlobal, // Se pasa el objeto global de matrimonios
                guardarEconomia: marcarCambiosParaGuardar,
                guardarMatrimonios: marcarCambiosParaGuardar,
                obtenerDatosDelChat: obtenerDatosDelChat,
                isGroup: isGroup,
                botJid: botJid,
                chatConfig: chatConfig,
                groupAdmins: [],
                groupMembers: [],
                botIsAdmin: false,
                // Asegurar que mentionedJids siempre sea un array para evitar errores .map()
                mentionedJids: m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.map(jidNormalizedUser) || [], 
            };

            const commandConfig = commandEntry.config || {};

            if (commandConfig.necesitaMetadata && isGroup) {
                let metadata;
                try {
                    metadata = await sock.groupMetadata(jid);
                } catch (error) {
                    console.error(`❌ Error al obtener metadata del grupo ${jid} para el comando ${cmd}:`, error);
                    await sock.sendMessage(jid, { text: '❌ No pude obtener la información del grupo. Asegúrate de que el bot sea administrador o que el grupo exista.' }, { quoted: m });
                    return;
                }

                if (!metadata || !Array.isArray(metadata.participants)) {
                    console.warn(`⚠️ Metadata incompleta o sin participantes para el grupo ${jid}.`);
                    await sock.sendMessage(jid, { text: '❌ No pude obtener la lista de participantes del grupo. Esto puede ser un problema temporal o que el bot no tenga permisos suficientes.' }, { quoted: m });
                    return;
                }

                extra.groupMembers = metadata.participants.map(p => ({
                    ...p,
                    id: jidNormalizedUser(p.id)
                }));

                extra.groupAdmins = extra.groupMembers
                                        .filter(p => p.admin === 'admin' || p.admin === 'superadmin')
                                        .map(p => p.id);
                
                extra.botIsAdmin = extra.groupAdmins.includes(botJid);
                console.log(`Comando $${cmd}: Necesita metadata. Bot es admin? ${extra.botIsAdmin}`);
            }

            console.log(`🚀 Ejecutando comando $${cmd}...`);
            await commandEntry.handler(sock, m, args, extra);
            console.log(`✅ Comando $${cmd} ejecutado con éxito.`);

        } catch (err) {
            console.error(`❌ Error en comando $${cmd}:`, err);
            await sock.sendMessage(jid, { text: '❌ ¡Oops! Ocurrió un error al ejecutar el comando. Intenta de nuevo más tarde.' });
        } finally {
            marcarCambiosParaGuardar();
        }
        console.log('--- Fin del procesamiento del comando ---\n');
    });
};

process.on('uncaughtException', err => {
    console.error('🔥 Error no capturado:', err);
    marcarCambiosParaGuardar();
});

process.on('unhandledRejection', err => {
    console.error('🔥 Promesa no manejada:', err);
    marcarCambiosParaGuardar();
});

const verificarYtDlp = () => {
    try {
        execSync('yt-dlp --version', { stdio: 'ignore' });
        return true;
    } catch {
        return false;
    }
};

const instalarYtDlp = () => {
    return new Promise((resolve) => {
        const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
        rl.question('⚠️ yt-dlp no está instalado. ¿Quieres instalarlo ahora? (s/n): ', (respuesta) => {
            rl.close();
            if (respuesta.trim().toLowerCase() === 's') {
                try {
                    console.log('Instalando yt-dlp globalmente. Esto puede tardar unos minutos...');
                    execSync('pip install yt-dlp', { stdio: 'inherit' });
                    console.log('✅ yt-dlp instalado con éxito.\n');
                    resolve(true);
                } catch (e) {
                    console.error('❌ Error al instalar yt-dlp con pip:', e.message);
                    console.log('Intentando con npm (requiere yt-dlp-npm):');
                    try {
                        execSync('npm install -g yt-dlp-npm', { stdio: 'inherit' });
                        console.log('✅ yt-dlp-npm (wrapper) instalado con éxito.\n');
                        resolve(true);
                    } catch (npmError) {
                        console.error('❌ Error al instalar yt-dlp con npm:', npmError.message);
                        console.log('Asegúrate de tener Python y pip instalados, o npm (Node.js) y permisos para la instalación global.');
                        resolve(false);
                    }
                }
            } else {
                console.warn('\n❌ No se instaló yt-dlp. El comando $play no funcionará sin él.\n');
                resolve(false);
            }
        });
    });
};

const main = async () => {
    const databaseDir = path.join(__dirname, 'database');
    if (!fs.existsSync(databaseDir)) {
        fs.mkdirSync(databaseDir, { recursive: true });
        console.log(`Directorio 'database' creado en: ${databaseDir}`);
    }

    const ytDlpOK = verificarYtDlp();
    if (!ytDlpOK) {
        const continuar = await instalarYtDlp();
        if (!continuar) return;
    }
    await iniciarConexion();
};

main();