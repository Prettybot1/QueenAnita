const fs = require('fs');
const path = './userData.json';

// Save a user's message for conversation history
function saveMessage(userId, message) {
    let data = JSON.parse(fs.readFileSync(path, 'utf8'));
    data[userId] = data[userId] || { messages: [] };
    data[userId].messages.push(message);
    fs.writeFileSync(path, JSON.stringify(data, null, 2));
}

// Save user data such as their name
function saveUserData(userId, userData) {
    let data = JSON.parse(fs.readFileSync(path, 'utf8'));
    data[userId] = userData;
    fs.writeFileSync(path, JSON.stringify(data, null, 2));
}

// Get user data from the database
function getUserData(userId) {
    let data = JSON.parse(fs.readFileSync(path, 'utf8'));
    return data[userId];
}

module.exports = { saveMessage, saveUserData, getUserData };
