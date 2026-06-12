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
