const { ConversationBot } = require("@microsoft/teamsfx");
const { TeamsActivityHandler } = require("botbuilder");
const { buildAdaptiveCard } = require("./adaptiveCard");
const notificationTemplate = require("./adaptiveCards/notification-default.json");
const { adapter } = require("./internal/initialize");
const { server } = require("./internal/server");

// HTTP trigger to send notification.
server.post("/api/notification", async (req, res) => {
  for (const target of await ConversationBot.installations()) {
    await target.sendAdaptiveCard(
      buildAdaptiveCard(
        {
          title: "New Event Occurred!",
          appName: "Contoso App Notification",
          description: `This is a sample http-triggered notification to ${target.type}`,
          notificationUrl: "https://www.adaptivecards.io/",
        },
        notificationTemplate
      )
    );
  }

  /****** To distinguish different target types ******/
  /** "Channel" means this bot is installed to a Team (default to notify General channel)
  if (target.type === "Channel") {
    // Directly notify the Team (to the default General channel)
    await target.sendAdaptiveCard(...);

    // List all channels in the Team then notify each channel
    const channels = await target.channels();
    for (const channel of channels) {
      await channel.sendAdaptiveCard(...);
    }

    // List all members in the Team then notify each member
    const members = await target.members();
    for (const member of members) {
      await member.sendAdaptiveCard(...);
    }
  }
  **/

  /** "Group" means this bot is installed to a Group Chat
  if (target.type === "Group") {
    // Directly notify the Group Chat
    await target.sendAdaptiveCard(...);

    // List all members in the Group Chat then notify each member
    const members = await target.members();
    for (const member of members) {
      await member.sendAdaptiveCard(...);
    }
  }
  **/

  /** "Person" means this bot is installed as a Personal app
  if (target.type === "Person") {
    // Directly notify the individual person
    await target.sendAdaptiveCard(...);
  }
  **/

  res.json({});
});

// Process Teams activity with Bot Framework.
const handler = new TeamsActivityHandler();
server.post("/api/messages", async (req, res) => {
  await adapter.processActivity(req, res, async (context) => {
    await handler.run(context);
  });
});