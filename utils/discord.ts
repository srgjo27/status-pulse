export async function sendDiscordAlert(
  monitorName: string,
  url: string,
  reason: string,
) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

  if (!webhookUrl) {
    console.error("Discord webhook URL not configured");
    return false;
  }

  const payload = {
    username: "StatusPulse Bot",
    avatar_url: "",
    embeds: [
      {
        title: "SERVICE DOWN ALERT",
        description: `Monitor **${monitorName}** is failing!`,
        color: 15158332,
        fields: [
          {
            name: "Target URL",
            value: url,
            inline: false,
          },
          {
            name: "Error",
            value: reason,
            inline: true,
          },
          {
            name: "Time",
            value: new Date().toLocaleString("en-US", {
              timeZone: "UTC",
              dateStyle: "full",
              timeStyle: "long",
            }),
            inline: true,
          },
        ],
        footer: {
          text: "StatusPulse Monitoring System",
        },
        timestamp: new Date().toISOString(),
      },
    ],
  };

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      await response.text();
      return false;
    }

    return true;
  } catch (error) {
    return false;
  }
}
