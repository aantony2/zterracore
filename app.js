/*-----------------------------------------------------------------------------
A simple echo bot for the Microsoft Bot Framework. 
-----------------------------------------------------------------------------*/

var restify = require('restify');
var builder = require('botbuilder');
var botbuilder_azure = require("botbuilder-azure");

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function() {
    console.log('%s listening to %s', server.name, server.url);
});

// Create chat connector for communicating with the Bot Framework Service
var connector = new builder.ChatConnector({
    appId: process.env.MicrosoftAppId,
    appPassword: process.env.MicrosoftAppPassword,
    openIdMetadata: process.env.BotOpenIdMetadata
});

// Listen for messages from users 
server.post('/api/messages', connector.listen());

/*----------------------------------------------------------------------------------------
 * Bot Storage: This is a great spot to register the private state storage for your bot. 
 * We provide adapters for Azure Table, CosmosDb, SQL Azure, or you can implement your own!
 * For samples and documentation, see: https://github.com/Microsoft/BotBuilder-Azure
 * ---------------------------------------------------------------------------------------- */

var tableName = 'botdata';
var azureTableClient = new botbuilder_azure.AzureTableClient(tableName, process.env['AzureWebJobsStorage']);
var tableStorage = new botbuilder_azure.AzureBotStorage({
    gzipData: false
}, azureTableClient);
var inMemoryStorage = new builder.MemoryBotStorage();

// Create your bot with a function to receive messages from the user
var bot = new builder.UniversalBot(connector);
bot.set('storage', tableStorage);

bot.dialog('/', function(session) {
    var card = new builder.HeroCard(session)
        .title("Microsoft Bot Framework")
        .text("Your bots - wherever your users are talking.")
        .images([
            builder.CardImage.create(session, "http://docs.botframework.com/images/demo_bot_image.png")
        ]);
    var msg = new builder.Message(session).attachments([card]);
    session.send(msg);
    session.send("Hi... I'm the Microsoft Bot Framework demo bot for Slack. I can show you everything you can use our Bot Builder SDK to do on Slack.");
    //session.beginDialog('/menu');
});

bot.on('typing', function (message) {
    var name = message.user ? message.user.name : null;
    var reply = new builder.Message()
                .address(message.address)
                .text("Hello %s. How can I help you today ?", name || 'there');
});