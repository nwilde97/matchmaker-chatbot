"use strict";

const queue = require("../queue");
const MESSAGES = require("../messages");

beforeEach(async () => {
    queue.init();
});

test('findMatchPairing returns valid pairs', async (done) => {
    let mock1 = jest.fn(msg => {});
    let mock2 = jest.fn(msg => {});
    await queue.findMatchPairing({ send: mock1},"discordId1", ["riotId1", "type1", "lane1", "lane2"]);
    await queue.findMatchPairing({ send: ()=> {}},"discordId2", ["riotId2", "type1", "lane3", "lane4"]);
    await queue.findMatchPairing({ send: ()=> {}},"discordId3", ["riotId3", "type2", "lane2", "lane1"]);
    await queue.findMatchPairing({ send: mock2},"discordId4", ["riotId4", "type1", "lane2", "lane1"]);
    expect(mock1).toHaveBeenCalledWith(MESSAGES.MATCH_PAIRING("discordId4"));
    expect(mock2).toHaveBeenCalledWith(MESSAGES.MATCH_PAIRING("discordId1"));
    done();
});

test('matches are removed after successfully paired', async (done) => {
    let mock1 = jest.fn(msg => {});
    let mock2 = jest.fn(msg => {});
    await queue.findMatchPairing({ send: mock1},"discordId1", ["riotId1", "type1", "lane1", "lane2"]);
    await queue.findMatchPairing({ send: mock1},"discordId2", ["riotId2", "type1", "lane1", "lane4"]);
    await queue.findMatchPairing({ send: mock2},"discordId3", ["riotId3", "type1", "lane2", "lane1"]);
    expect(mock1).toHaveBeenCalledWith(MESSAGES.MATCH_PAIRING("discordId1"));
    expect(mock1).toHaveBeenCalledWith(MESSAGES.MATCH_PAIRING("discordId2"));
    expect(mock2).toHaveBeenCalledWith(MESSAGES.ADDED_TO_QUEUE);
    done();
});

test('users cannot be paired with themselves', async (done) => {
    let mock1 = jest.fn(msg => {});
    await queue.findMatchPairing({ send: mock1},"discordId1", ["riotId1", "type1", "lane1", "lane2"]);
    await queue.findMatchPairing({ send: mock1},"discordId1", ["riotId1", "type1", "lane1", "lane2"]);
    expect(mock1).toHaveBeenCalledWith(MESSAGES.ADDED_TO_QUEUE);
    expect(mock1).toHaveBeenCalledWith(MESSAGES.ADDED_TO_QUEUE);
    expect(mock1).toHaveBeenCalledTimes(2);
    done();
});
