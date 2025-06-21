const { Client, GatewayIntentBits, EmbedBuilder, Events, ActivityType, ButtonBuilder, ButtonStyle, ActionRowBuilder, ChannelType } = require('discord.js');
const { Collection, Partials, MessageFlags } = require('discord.js');
const config = require('./config');
const { deploy } = require('./deploy-commands');

deploy;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.DirectMessageTyping
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction]
});

const fs = require('node:fs');
const path = require('node:path');

client.on('error', console.error);
client.on('warn', console.warn);

client.commands = new Collection();


client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction, client);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
		}
	}
});


const openTickets = new Map(); 

client.once('ready', async () => {
  console.log(`
╭────────────────────────────────────────────────────────╮
│ ${client.user.tag} has logged in successfully!         │
│ Bot ID: ${client.user.id}                             │
│ Status: Online                                       │
│ Activity: DM Me for Support                          │
│ Ready to assist users with support tickets.  
| Made by BxJaden524                                     │
╰────────────────────────────────────────────────────────╯
`);

  client.user.setPresence({
    activities: [{ name: 'DM Me for Support', type: ActivityType.Playing }],
    status: 'online',
  });
});

client.on('messageCreate', async message => {
  try {
    if (message.author.bot) return;
    if (openTickets.has(message.author.id)) {
      return;
    }

    if (message.channel.type === ChannelType.DM) {
      console.log('Processing DM from', message.author.username);

      const supportEmbed = new EmbedBuilder()
        .setAuthor({ 
          name: `${config.Misc.communityname}`, 
          iconURL: `${config.Misc.logo}` || `https://www.example.com`, 
          url: `${config.Misc.communitywebsite}` 
      })
        .setDescription(`**${config.Misc.communityname} Support**\nThank you for opening a support ticket, please choose below to which option bests fits your inquiry continue:\n- **General Support**:\n- Do you have a general question?\n- Are you not looking to report a Staff Member?\n- Do you not want to engage in a partnership with us?\nIf so, this ticket is your home.\n- **Staffing Support**:\n- Are you looking to report a Staff Member? - Did you see a Staff Member break rules?\nIf so, this ticket is your home.\n- **Partnership Support**:\n- Are you looking to partner with us or have some contribution offer?\nIf so, this ticket is your home.`)
        .setColor(`${config.Misc.Embeds.embedcolor}` || 0x0099FF)
        .setImage(`${config.Misc.Embeds.image}` || `https://www.example.com`)
        .setThumbnail(`${config.Misc.Embeds.thumbnail}` || `https://www.example.com`)
        .setFooter({ text: `${config.Misc.Embeds.embedfooter}` || `Ticket Support by BxJaden524`, iconURL: `${config.Misc.logo}` || `https://www.example.com` });
      
      const button1 = new ButtonBuilder()
        .setCustomId('general_support')
        .setLabel('📨 General Inquiry')
        .setStyle(ButtonStyle.Secondary);

      const button2 = new ButtonBuilder()
        .setCustomId('report_support')
        .setLabel('❗Staffing Inquiry')
        .setStyle(ButtonStyle.Secondary);

      const button3 = new ButtonBuilder()
        .setCustomId('partnership_support')
        .setLabel('🧑‍🤝‍🧑 Partnership Inquiry')
        .setStyle(ButtonStyle.Secondary);

      const button4 = new ButtonBuilder()
        .setCustomId('cancel_support')
        .setLabel('❌ Cancel Inquiry')
        .setStyle(ButtonStyle.Danger);

      const row = new ActionRowBuilder().addComponents(button1, button2, button3, button4);

      const sentMessage = await message.author.send({
        embeds: [supportEmbed],
        components: [row],
      });
      console.log('Sent support message to user.');

      const filter = i => i.user.id === message.author.id;
      const collector = sentMessage.createMessageComponentCollector({
        filter,
        time: 60000,
      });

      collector.on('collect', async interaction => {
        console.log('Button pressed:', interaction.customId);


        if (interaction.customId === 'general_support') {
          const updatedButton = new ButtonBuilder()
            .setCustomId(interaction.customId)
            .setLabel(interaction.component.label)
            .setStyle(interaction.component.style)
            .setDisabled(true);

          const updatedRow = new ActionRowBuilder().addComponents(updatedButton);
          await interaction.update({ components: [updatedRow] });


          const guild = client.guilds.cache.get(`${config.MainguildId}`);
          if (!guild) throw new Error('Guild not found.');

          const category = guild.channels.cache.get(`${config.Tickets.GeneralSupport.categoryId}`);
          if (!category) throw new Error('Category channel not found.');

          const channelName = `supportinq-${interaction.user.username}`;
          const channel = await guild.channels.create({
            name: channelName,
            type: ChannelType.GuildText,
            parent: category,
            permissionOverwrites: [
              { id: guild.id, deny: ['ViewChannel'] },
              { id: interaction.user.id, allow: ['ViewChannel', 'SendMessages']},
              { id: `${config.Tickets.GeneralSupport.RoleId}`, allow: ['ViewChannel', 'SendMessages'] }
            ],
          });

          openTickets.set(interaction.user.id, channel); // Save the channel to temp storage

          const supportEmbed = new EmbedBuilder()
          .setAuthor({ 
            name: `${config.Misc.communityname}`, 
            iconURL: `${config.Misc.logo}` || `https://www.example.com`, 
            url: `${config.Misc.communitywebsite}` 
        })
            .setDescription('New Support Ticket Created')
            .addFields({ name: `Ticket User:`, value: `<@${interaction.user.id}>` }, { name: `Ticket Type:`, value: `General Support Ticket` })
            .setColor(`${config.Misc.Embeds.embedcolor}` || 0x0099FF)
            .setImage(`${config.Misc.Embeds.image}` || `https://www.example.com`)
            .setThumbnail(`${config.Misc.Embeds.thumbnail}` || `https://www.example.com`)
            .setFooter({ text: `${config.Misc.Embeds.embedfooter}` || `Ticket Support by BxJaden524`, iconURL: `${config.Misc.logo}` || `https://www.example.com` });

          const confirmationEmbed = new EmbedBuilder()
          .setAuthor({ 
            name: `${config.Misc.communityname}`, 
            iconURL: `${config.Misc.logo}` || `https://www.example.com`, 
            url: `${config.Misc.communitywebsite}` 
        })
            .setDescription(`${config.Tickets.GeneralSupport.ticketopened}` || 'Thank you for opening a ticket, please state your reasoning for opening a ticket and staff will be with you shortly\n\nIf you open a ticket and leave no details after *ONE HOUR* it will be closed.')
            .setColor(`${config.Misc.Embeds.embedcolor}` || 0x0099FF)
            .setImage(`${config.Misc.Embeds.image}` || `https://www.example.com`)
            .setThumbnail(`${config.Misc.Embeds.thumbnail}` || `https://www.example.com`)
            .setFooter({ text: `${config.Misc.Embeds.embedfooter}` || `Ticket Support by BxJaden524`, iconURL: `${config.Misc.logo}` || `https://www.example.com` });

          
            const buttonClaim = new ButtonBuilder()
            .setCustomId('claim_ticket')
            .setLabel('🔒 Claim Ticket')
            .setStyle(ButtonStyle.Success);

            const buttonClose = new ButtonBuilder()
            .setCustomId('close_ticket')
            .setLabel('🔒 Close Ticket')
            .setStyle(ButtonStyle.Danger);

          const rowWithCloseButton = new ActionRowBuilder().addComponents(buttonClaim, buttonClose);

          await interaction.user.send({ embeds: [confirmationEmbed] });
          await channel.send({
            content: `<@&${config.Tickets.GeneralSupport.RoleId}>`,
            embeds: [supportEmbed],
            components: [rowWithCloseButton]
          });
          
        }
        if (interaction.customId === 'report_support') {
          const updatedButton = new ButtonBuilder()
            .setCustomId(interaction.customId)
            .setLabel(interaction.component.label)
            .setStyle(interaction.component.style)
            .setDisabled(true);

          const updatedRow = new ActionRowBuilder().addComponents(updatedButton);
          await interaction.update({ components: [updatedRow] });
          const guild = client.guilds.cache.get(`${config.MainguildId}`);
          if (!guild) throw new Error('Guild not found.');

          const category = guild.channels.cache.get(`${config.Tickets.GeneralSupport.categoryId}`);
          if (!category) throw new Error('Category channel not found.');

          const channelName = `reportinq-${interaction.user.username}`;
          const channel = await guild.channels.create({
            name: channelName,
            type: ChannelType.GuildText,
            parent: category,
            permissionOverwrites: [
              { id: guild.id, deny: ['ViewChannel'] },
              { id: interaction.user.id, allow: ['ViewChannel', 'SendMessages'] },
              { id: `${config.Tickets.ReportSupport.RoleId}`, allow: ['ViewChannel', 'SendMessages'] }
            ],
          });

          openTickets.set(interaction.user.id, channel);

          const supportEmbed = new EmbedBuilder()
          .setAuthor({ 
            name: `${config.Misc.communityname}`, 
            iconURL: `${config.Misc.logo}` || `https://www.example.com`, 
            url: `${config.Misc.communitywebsite}` 
        })
            .setDescription('New Support Ticket Created')
            .addFields({ name: `Ticket User:`, value: `<@${interaction.user.id}>` }, { name: `Ticket Type:`, value: `Report Support Ticket` })
            .setColor(`${config.Misc.Embeds.embedcolor}` || 0x0099FF)
            .setImage(`${config.Misc.Embeds.image}` || `https://www.example.com`)
            .setThumbnail(`${config.Misc.Embeds.thumbnail}` || `https://www.example.com`)
            .setFooter({ text: `${config.Misc.Embeds.embedfooter}` || `Ticket Support by BxJaden524`, iconURL: `${config.Misc.logo}` || `https://www.example.com` });

          const confirmationEmbed = new EmbedBuilder()
            .setAuthor({ 
              name: `${config.Misc.communityname}`, 
              iconURL: `${config.Misc.logo}` || `https://www.example.com`, 
              url: `${config.Misc.communitywebsite}` || `https://webstore.bxjaden524.xyz` 
          })
          .setDescription(`${config.Tickets.ReportSupport.ticketopened}` || 'Thank you for opening a ticket, please state your reasoning for opening a ticket and staff will be with you shortly\n\nIf you open a ticket and leave no details after *ONE HOUR* it will be closed.')
          .setColor(`${config.Misc.Embeds.embedcolor}` || 0x0099FF)
            .setImage(`${config.Misc.Embeds.image}` || `https://www.example.com`)
            .setThumbnail(`${config.Misc.Embeds.thumbnail}` || `https://www.example.com`)
            .setFooter({ text: `${config.Misc.Embeds.embedfooter}` || `Ticket Support by BxJaden524`, iconURL: `${config.Misc.logo}` || `https://www.example.com` });
            const buttonClaim = new ButtonBuilder()
            .setCustomId('claim_ticket')
            .setLabel('🔒 Claim Ticket')
            .setStyle(ButtonStyle.Success);

            const buttonClose = new ButtonBuilder()
            .setCustomId('close_ticket')
            .setLabel('🔒 Close Ticket')
            .setStyle(ButtonStyle.Danger);


          const rowWithCloseButton = new ActionRowBuilder().addComponents(buttonClaim, buttonClose);

          await interaction.user.send({ embeds: [confirmationEmbed] });
          await channel.send({
            content: `<@&${config.Tickets.ReportSupport.RoleId}>`,
            embeds: [supportEmbed],
            components: [rowWithCloseButton] 
          });
          
        }  
        if (interaction.customId === 'partnership_support') {
          const updatedButton = new ButtonBuilder()
            .setCustomId(interaction.customId)
            .setLabel(interaction.component.label)
            .setStyle(interaction.component.style)
            .setDisabled(true);

          const updatedRow = new ActionRowBuilder().addComponents(updatedButton);
          await interaction.update({ components: [updatedRow] });
          const guild = client.guilds.cache.get(`${config.MainguildId}`);
          if (!guild) throw new Error('Guild not found.');

          const category = guild.channels.cache.get(`${config.Tickets.PartnershipSupport.categoryId}`);
          if (!category) throw new Error('Category channel not found.');

          const channelName = `partnerinq-${interaction.user.username}`;
          const channel = await guild.channels.create({
            name: channelName,
            type: ChannelType.GuildText,
            parent: category,
            permissionOverwrites: [
              { id: guild.id, deny: ['ViewChannel'] },
              { id: interaction.user.id, allow: ['ViewChannel', 'SendMessages'] },
              { id: `${config.Tickets.PartnershipSupport.RoleId}`, allow: ['ViewChannel', 'SendMessages'] }
            ],
          });

          openTickets.set(interaction.user.id, channel); 

          const supportEmbed = new EmbedBuilder()
            .setAuthor({ 
              name: `${config.Misc.communityname}`, 
              iconURL: `${config.Misc.logo}` || `https://www.example.com`, 
              url: `${config.Misc.communitywebsite}` 
          })
            .setDescription('New Support Ticket Created')
            .addFields({ name: `Ticket User:`, value: `<@${interaction.user.id}>` }, { name: `Ticket Type:`, value: `Partnership Support Ticket` })
            .setColor(`${config.Misc.Embeds.embedcolor}` || 0x0099FF)
            .setImage(`${config.Misc.Embeds.image}` || `https://www.example.com`)
            .setThumbnail(`${config.Misc.Embeds.thumbnail}` || `https://www.example.com`)
            .setFooter({ text: `${config.Misc.Embeds.embedfooter}` || `Ticket Support by BxJaden524`, iconURL: `${config.Misc.logo}` || `https://www.example.com` });
          const confirmationEmbed = new EmbedBuilder()
            .setAuthor({ 
              name: `${config.Misc.communityname}`, 
              iconURL: `${config.Misc.logo}` || `https://www.example.com`, 
              url: `${config.Misc.communitywebsite}` 
          })
          .setDescription(`${config.Tickets.PartnershipSupport.ticketopened}` || 'Thank you for opening a ticket, please state your reasoning for opening a ticket and staff will be with you shortly\n\nIf you open a ticket and leave no details after *ONE HOUR* it will be closed.')
          .setColor(`${config.Misc.Embeds.embedcolor}` || 0x0099FF)
            .setImage(`${config.Misc.Embeds.image}` || `https://www.example.com`)
            .setThumbnail(`${config.Misc.Embeds.thumbnail}` || `https://www.example.com`)
            .setFooter({ text: `${config.Misc.Embeds.embedfooter} | RESPONSE` || `Ticket Support by BxJaden524`, iconURL: `${config.Misc.logo}` || `https://www.example.com` });

            const buttonClaim = new ButtonBuilder()
            .setCustomId('claim_ticket')
            .setLabel('🔒 Claim Ticket')
            .setStyle(ButtonStyle.Success);

            const buttonClose = new ButtonBuilder()
            .setCustomId('close_ticket')
            .setLabel('🔒 Close Ticket')
            .setStyle(ButtonStyle.Danger);


          const rowWithCloseButton = new ActionRowBuilder().addComponents(buttonClaim, buttonClose);

          await interaction.user.send({ embeds: [confirmationEmbed] });
          await channel.send({
            content: `<@&${config.Tickets.ReportSupport.RoleId}>`,
            embeds: [supportEmbed],
            components: [rowWithCloseButton] 
          });
          
        }       
        if (interaction.customId === 'cancel_support') {
          const updatedButton = new ButtonBuilder()
            .setCustomId(interaction.customId)
            .setLabel(interaction.component.label)
            .setStyle(interaction.component.style)
            .setDisabled(true);
          const row = new ActionRowBuilder().addComponents(updatedButton);
          interaction.update({ components: [row] });

          await interaction.user.send({ content: `Canceled` });
        }     
      });

      collector.on('end', async collected => {
        if (collected.size === 0) {
          await sentMessage.edit({
            content: 'You took too long to respond. Please start the ticket process again.',
            embeds: [],
            components: [],
          });
        }
      });
    }
  } catch (error) {
    console.error('Error handling message:', error);
  }
});

const DiscordTranscripts = require('discord-html-transcripts'); 

client.on('interactionCreate', async interaction => {
  if (!interaction.isButton()) return;

  if (interaction.customId === 'close_ticket') {
    const updatedButton = new ButtonBuilder()
      .setCustomId(interaction.customId)
      .setLabel(interaction.component.label)
      .setStyle(interaction.component.style)
      .setDisabled(true);  
    const row = new ActionRowBuilder().addComponents(updatedButton);
    
    await interaction.update({ components: [row] });

    // Close the ticket and notify the user
    const ticketChannel = interaction.channel;
    const userId = [...openTickets.entries()].find(([, channel]) => channel.id === ticketChannel.id)?.[0];
    
    if (userId) {
      const user = await client.users.fetch(userId);
      openTickets.delete(userId); 

      const transcript = await DiscordTranscripts.createTranscript(ticketChannel, {
        limit: -1, 
        returnBuffer: false, 
        fileName: `ticket-${ticketChannel.id}.html`
      });

      await user.send({
        embeds: [
          new EmbedBuilder()
          .setAuthor({ 
            name: `${config.Misc.communityname}`, 
            iconURL: `${config.Misc.logo}` || `https://www.example.com`, 
            url: `${config.Misc.communitywebsite}` 
        })
            .setDescription(`Your support ticket has been closed by <@${interaction.user.id}>. Here is a transcript of your conversation:`)
            .setColor(0x0099FF)
            .setFooter({ text: `${config.Misc.Embeds.embedfooter}` || `Ticket Support by BxJaden524`, iconURL: `${config.Misc.logo}` || `https://www.example.com` })
        ],
        files: [transcript]  
      });


      const logChannel = client.channels.cache.get(`${config.Tickets.globalloggingchannel}`); 
      if (logChannel) {
        await logChannel.send({embeds: [
          new EmbedBuilder()
          .setAuthor({ 
            name: `${config.Misc.communityname}`, 
            iconURL: `${config.Misc.logo}` || `https://www.example.com`, 
            url: `${config.Misc.communitywebsite}` 
        })
            .setDescription('Support ticket has been closed. Here is a transcript of the conversation:')
            .setColor(0x0099FF)
            .addFields(
              {name: `User:`, value: `${user}`},
              {name: `Moderator:`, value: `<@${interaction.user.id}>`},
              {name: `User ID:`, value: `${userId}`}
            )
            .setFooter({ text: `${config.Misc.Embeds.embedfooter}` || `Ticket Support by BxJaden524`, iconURL: `${config.Misc.logo}` || `https://www.example.com` })
        ],
        files: [transcript]  
      })
      }

      await ticketChannel.delete();
    }
  }
  if (interaction.customId === 'claim_ticket') {
    
    const claimembed = new EmbedBuilder()
    .setAuthor({ 
      name: `${config.Misc.communityname}`, 
      iconURL: `${config.Misc.logo}` || `https://www.example.com`, 
      url: `${config.Misc.communitywebsite}` 
  })
    .setDescription('Your ticket has been claimed. Please remember to be respectful and kind to our staff members. They take time out of their day to assist you.')
    .setColor(`${config.Misc.Embeds.embedcolor}` || 0x0099FF)
    .setImage(`${config.Misc.Embeds.image}` || `https://www.example.com`)
    .setThumbnail(`${config.Misc.Embeds.thumbnail}` || `https://www.example.com`)
    .setFooter({ text: `${config.Misc.Embeds.embedfooter}` || `Ticket Support by BxJaden524`, iconURL: `${config.Misc.logo}` || `https://www.example.com` });

    const claimembed2 = new EmbedBuilder()
    .setAuthor({ 
      name: `${config.Misc.communityname}`, 
      iconURL: `${config.Misc.logo}` || `https://www.example.com`, 
      url: `${config.Misc.communitywebsite}` 
  })
    .setDescription('This ticket was claimed. Find information below.')
    .addFields({ name: `Staff Member:`, value: `<@${interaction.user.id}>` })
    .setColor(`${config.Misc.Embeds.embedcolor}` || 0x0099FF)
    .setImage(`${config.Misc.Embeds.image}` || `https://www.example.com`)
    .setThumbnail(`${config.Misc.Embeds.thumbnail}` || `https://www.example.com`)
    .setFooter({ text: `${config.Misc.Embeds.embedfooter}` || `Ticket Support by BxJaden524`, iconURL: `${config.Misc.logo}` || `https://www.example.com` });


    const user = interaction.user

    await user.send({embeds: [claimembed]})
    await interaction.channel.send({embeds: [claimembed2]})
    await interaction.reply({content: `Ticket Claimed!`, ephemeral: true})
    
  
  }
});




client.on('messageCreate', async message => {
  try {
    if (message.author.bot) return;

    if (message.channel.type === ChannelType.DM) {
      console.log('Processing DM from', message.author.username);

      if (openTickets.has(message.author.id)) {
        const ticketChannel = openTickets.get(message.author.id);
        await ticketChannel.send({
          embeds: [
            new EmbedBuilder()
            .setAuthor({ 
              name: `${config.Misc.communityname}`, 
              iconURL: `${config.Misc.logo}` || `https://www.example.com`, 
              url: `${config.Misc.communitywebsite}` 
          })
              .setDescription(message.content)
              .setColor(`${config.Misc.Embeds.embedcolor}` || 0x0099FF)
              .setFooter({ text: `From: ${message.author.username}`, iconURL: message.author.displayAvatarURL() })
              .setTimestamp()
          ]
        });
      } else {
        return;
      }
      return;
    }

    if (message.channel.type === ChannelType.GuildText && message.channel.name.startsWith('supportinq-')) {
      const userId = [...openTickets.entries()].find(([, channel]) => channel.id === message.channel.id)?.[0];
      if (userId) {
        const user = await client.users.fetch(userId);
        await user.send({
          embeds: [
            new EmbedBuilder()
            .setAuthor({ 
              name: `${config.Misc.communityname}`, 
              iconURL: `${config.Misc.logo}` || `https://www.example.com`, 
              url: `${config.Misc.communitywebsite}` 
          })
              .setDescription(message.content)
              .setColor(`${config.Misc.Embeds.embedcolor}` || 0x0099FF)
              .setImage(`${config.Misc.Embeds.image}` || `https://www.example.com`)
              .setThumbnail(`${config.Misc.Embeds.thumbnail}` || `https://www.example.com`)
              .setFooter({ text: `${config.Misc.Embeds.embedfooter}` || `Ticket Support by BxJaden524`, iconURL: `${config.Misc.logo}` || `https://www.example.com` })
              .setTimestamp()
          ]
        });
      }
    }
  } catch (error) {
    console.error('Error handling message:', error);
  }
});



client.login(config.Main.Token);
