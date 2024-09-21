const emojiRegex = require('emoji-regex');

function detectEmojis(message) {
    const regex = emojiRegex();
    return message.match(regex) || [];
}

function getEmojiResponse(message) {
    if (message.includes('happy')) return '😊';
    if (message.includes('sad')) return '😢';
    return '👍';
}

module.exports = { detectEmojis, getEmojiResponse };
