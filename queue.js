"use strict";

const MESSAGES = require("./messages");
let activeUsers = [];

const isValidPairing = async (userA, userB) => {
    //This method would ideally reach out to some sort of API to determine if the two users were equally matched
    const laneMatches = [userB.laneOption1, userB.laneOption2].reduce((options, lane) => {
        if([userA.laneOption1, userA.laneOption2].some(lane2 => lane2 === lane)){
            options.push(lane);
        }
        return options;
    }, []);
    if(userA.matchType === userB.matchType && laneMatches.length > 0 ){
        return true;
    }
    return false;
}

module.exports = {
    init: async () => {
      activeUsers = [];
    },
    findMatchPairing: async (channel, discordUserId, [riotUserId, matchType, laneOption1, laneOption2]) => {
        const userIdx = activeUsers.findIndex(user => user.discordUserId === discordUserId);

        //Remove users who are already in the queue
        if(userIdx > -1){
            activeUsers.splice(userIdx, 1);
        }

        //Search for pairing
        const opponents = [];
        for(let opponentIdx = 0; opponentIdx < activeUsers.length; ++opponentIdx){
            const opponent = activeUsers[opponentIdx];
            const validPair = await isValidPairing({laneOption1, laneOption2, matchType}, opponent);
            if(validPair){
                opponents.push(opponentIdx);
            }
        }
        if(opponents.length > 0){
            //Valid match found, message both users that a match has been found and remove opponent from queue
            const opponent = activeUsers.splice(opponents.shift(),1).shift();
            console.log(`Valid pairing found ${discordUserId} ${opponent.discordUserId}`);
            opponent.channel.send(MESSAGES.MATCH_PAIRING(discordUserId));
            channel.send(MESSAGES.MATCH_PAIRING(opponent.discordUserId));
        } else {
            activeUsers.push({discordUserId, channel, riotUserId, matchType, laneOption1, laneOption2, time: Date.now()});
            channel.send(MESSAGES.ADDED_TO_QUEUE);
        }
    }
}
