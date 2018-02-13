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
bot.set('storage', inMemoryStorage);

bot.dialog('/', [
    function(session) {
        var card = new builder.HeroCard(session)
            .title("Welcome to ZTerrCore")
            .text("McKesson's Ops Bot !")
            .images([
                builder.CardImage.create(session, "https://raw.githubusercontent.com/agnelantony2/zterracore/master/images/z.png")
            ]);
        var msg = new builder.Message(session).attachments([card]);
        session.send(msg);
        session.send("How can I help ? Type 'help' for menu options.");
        if (session.entity == 'help') {
            session.send("Opening Help...");
            session.beginDialog('/help');
        }
    },
    function(session, results) {
        if (results.response && results.response.entity == 'help') {
            session.beginDialog('/help');
        } else {
            session.endDialog();
        }
    },
]);

bot.dialog('/help', [
    function(session) {
        builder.Prompts.choice(session, "What category you would like information on ?", "Azure Resource|OneCloud Resource|Network|BAP|Outage|Quit", {
            listStyle: builder.ListStyle.button
        });
    },
    function(session, results) {
        if (results.response && results.response.entity != 'Quit') {
            // Launch demo dialog
            //session.beginDialog('/' + results.response.entity);
            session.send("Work in progress...Check back soon.");
            session.endDialog();
        } else {
            // Exit the menu
            session.send("Goodbye. Later !");
            session.endDialog();
        }
    },
    function(session, results) {
        // The menu runs a loop until the user chooses to (quit).
        session.replaceDialog('/help');
    }
]).triggerAction({ matches: /^help/i });