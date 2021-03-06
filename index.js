"use strict";

require('dotenv').config();
const MESSAGES = require('./messages');
const queue = require('./queue');
const Discord = require('discord.js');
const TOKEN = process.env.TOKEN;

(async () => {
 await queue.init();

 const bot = new Discord.Client();

 bot.on('ready', () => {
  console.info(`Logged in as ${bot.user.tag}!`);
 });

 bot.on('message', async msg => {
  if(msg.author.bot){
   return false;
  }
  const dm = await msg.author.createDM();
  const args = msg.content.toLowerCase().split(/ +/);
  const command = args.shift();
  if(command === "pair" && args.length !== 4){
   return dm.send(MESSAGES.COMMAND_INSTRUCTIONS);
  } else if(command === "pair"){
   try {
    const [riotUserId, matchType, laneOption1, laneOption2] = args;

    //Validate match type
    // NOTE: this list could be loaded dynamically, hard coded here as an example implementation
    const validMatchTypes = ["camera","cs","inting"];
    if(!validMatchTypes.some(type => matchType === type)){
     return dm.send(MESSAGES.INVALID_TYPE);
    }

    //Validate lanes
    const validLaneOptions = ["top", "mid", "adc", "sup", "jg"];
    if([laneOption1, laneOption2].some(a => !validLaneOptions.some(b => a === b))){
     return dm.send(MESSAGES.INVALID_LANES);
    }

    //Add user to match queue and look for matches
    await queue.findMatchPairing(dm, msg.author.id, args);

   } catch (error) {
    console.error(error);
    dm.send('I was unable to complete your request');
   }
  }
 });

 await bot.login(TOKEN);
})();
