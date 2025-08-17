import { downloadMediaMessage } from '@whiskeysockets/baileys';
import { Sticker, StickerTypes } from 'wa-sticker-formatter';

export default async (sock, m) => {
  const tipo = Object.keys(m.message || {})[0];

  // Verifica si es imagen directa o imagen citada
  let mediaMsg = null;

  if (tipo === 'imageMessage') {
    mediaMsg = m;
  } else if (tipo === 'extendedTextMessage') {
    const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    if (quoted?.imageMessage) {
      mediaMsg = {
        key: {
          remoteJid: m.key.remoteJid,
          id: m.message.extendedTextMessage.contextInfo.stanzaId,
          participant: m.message.extendedTextMessage.contextInfo.participant,
        },
        message: {
          imageMessage: quoted.imageMessage,
        },
      };
    }
  }

  if (!mediaMsg) {
    return sock.sendMessage(
      m.key.remoteJid,
      {
        text: '❌ Envía o responde a una imagen para convertirla en sticker.',
      },
      { quoted: m }
    );
  }

  try {
    const buffer = await downloadMediaMessage(
      mediaMsg,
      'buffer',
      {},
      {
        logger: console,
        reuploadRequest: sock.updateMediaMessage,
      }
    );

    const sticker = new Sticker(buffer, {
      pack: 'StickerBot',
      author: 'TuNombre',
      type: StickerTypes.FULL,
      quality: 70,
    });

    const stickerBuffer = await sticker.toBuffer();

    await sock.sendMessage(
      m.key.remoteJid,
      {
        sticker: stickerBuffer,
      },
      { quoted: m }
    );
  } catch (err) {
    console.error('❌ Error al crear sticker:', err);
    await sock.sendMessage(
      m.key.remoteJid,
      {
        text: '❌ Ocurrió un error al procesar el sticker.',
      },
      { quoted: m }
    );
  }
};
