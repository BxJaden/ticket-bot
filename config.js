/*
TICKETEER!!

Thank you for using my Ticketteer bot, as a reminder this bot stores things LOCALLY. Please do NOT turn off the bot while any tickets are active.

As another reminder, this bot is FREE. Everything will not be perfect. If you encounter any errors it's recommended you report them in our Discord Server.

If somehow you are not in our Discord Server, you can join it via the website in the README.md file.

If you somehow deleted that file and didn't read it, head to https://webstore.bxjaden524.xyz


*/

module.exports = {
    Main: {
        Token: '', // The Discord Bot Token
        ClientID: '', // Discord Bot Client ID
        LoggingChannel: '', // The channel where any other logs should be sent.
    },
    
    MainguildId: '', // The Main Server ID


Tickets: {

    GeneralSupport: {
    categoryId: '', // The category where the ticket will be opened.
    RoleId: '', // The role that can view & interact with the ticket
    TicketLoggingChannel: '', // The channel where the ticket transcript will be logged
    ticketopened: '', // This is what the bot will say after the ticket is opened
},

    ReportSupport: {
    categoryId: '', // The category where the ticket will be opened.
    RoleId: '', // The role that can view & interact with the ticket
    TicketLoggingChannel: '', // The channel where the closing of the ticket will be logged and the transcript will be sent
    ticketopened: '', // This is what the bot will say after the ticket is opened
},  

    PartnershipSupport: {
    categoryId: '', // The category where the ticket will be opened. 
    staffRoleId: '', // The role that can view & interact with the ticket
    TicketLoggingChannel: '', // The channel where the closing of the ticket will be logged and the transcript will be sent
    ticketopened: '', // This is what the bot will say after the ticket is opened
},     
},
Misc: {

    communitywebsite: '', // Community Website
    logo: '', // Community Logo
    communityname: '', // Community Name
    shortcommunityname: '', // Shortened Community name, like BBRP

Embeds: {

    embedcolor: '#ec710d', // Has to be actual color hexadeciamal #ec710d for example
    thumbnail: '', // Embed Thumbnails
    image: '', // Embed Images
    embedfooter: '', // Embed Footers
},

},

};