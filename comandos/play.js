import { exec } from 'child_process';

export default async (sock, m, args) => {
  const jid = m.key.remoteJid;
  const query = args.join(' ').trim();

  if (!query) {
    return sock.sendMessage(jid, {
      text: '🔍 Escribe una canción o video a buscar. Ejemplo: $play calm down'
    }, { quoted: m });
  }

  const command = `yt-dlp "ytsearch1:${query}" -j --no-warnings`;

  exec(command, async (error, stdout, stderr) => {
    if (error) {
      console.error('❌ Error al ejecutar yt-dlp:', error);
      return sock.sendMessage(jid, {
        text: '❌ No se pudo buscar el video. Asegúrate de tener instalado yt-dlp.'
      }, { quoted: m });
    }

    if (!stdout) {
      return sock.sendMessage(jid, {
        text: '⚠️ No se recibió respuesta de yt-dlp.'
      }, { quoted: m });
    }

    try {
      const videoData = JSON.parse(stdout.trim());
      const { title, webpage_url, duration_string, uploader } = videoData;

      if (!title || !webpage_url) {
        return sock.sendMessage(jid, {
          text: '⚠️ No se encontró ningún resultado.'
        }, { quoted: m });
      }

      const respuesta = `🎵 *${title}*\n👤 *Canal:* ${uploader || 'Desconocido'}\n⏱️ *Duración:* ${duration_string || 'desconocida'}\n🔗 ${webpage_url}`;

      await sock.sendMessage(jid, {
        text: respuesta
      }, { quoted: m });
    } catch (parseError) {
      console.error('❌ Error al parsear salida de yt-dlp:', parseError);
      await sock.sendMessage(jid, {
        text: '⚠️ No se pudo procesar el resultado. Prueba con otra búsqueda.'
      }, { quoted: m });
    }
  });
};
