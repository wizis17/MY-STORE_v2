const TELEGRAM_API_BASE = 'https://api.telegram.org';

export async function sendTelegramMessage(message: string): Promise<void> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  // Skip silently when Telegram is not configured.
  if (!botToken || !chatId) return;

  try {
    await fetch(`${TELEGRAM_API_BASE}/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        disable_web_page_preview: true,
      }),
      cache: 'no-store',
    });
  } catch (error) {
    console.error('Telegram notification failed:', error);
  }
}

export async function sendTelegramPhoto(photoUrl: string, caption: string): Promise<void> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  // Skip silently when Telegram is not configured.
  if (!botToken || !chatId) return;

  try {
    // Fetch the image locally from the URL first to support localhost/development URLs
    const imageRes = await fetch(photoUrl);
    if (!imageRes.ok) {
      throw new Error(`Failed to fetch photo from URL: ${imageRes.statusText}`);
    }
    const blob = await imageRes.blob();

    const formData = new FormData();
    formData.append('chat_id', chatId);
    // Send as a document file to avoid displaying a huge image in the chat
    formData.append('document', blob, 'receipt.jpg');
    formData.append('caption', caption);

    const res = await fetch(`${TELEGRAM_API_BASE}/bot${botToken}/sendDocument`, {
      method: 'POST',
      body: formData,
      cache: 'no-store',
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('Telegram sendDocument response error:', errText);
      // Fallback to text message if document sending fails
      await sendTelegramMessage(`${caption}\n\n📎 Receipt Link: ${photoUrl}`);
    }
  } catch (error) {
    console.error('Telegram document notification failed, falling back to text:', error);
    // Fallback to text message if image fetching or sending fails
    await sendTelegramMessage(`${caption}\n\n📎 Receipt Link: ${photoUrl}`);
  }
}
