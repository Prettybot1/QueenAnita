const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const pino = require('pino');
const readline = require('readline');
const fs = require('fs');
const path = require('path');
const NodeCache = require('node-cache');

// Import your database and helper modules
const { saveMessage, getUserData, saveUserData } = require('./database');
const { processImage } = require('./helpers');
const { getAIResponse } = require('./aiModule');
const emojiHandler = require('./emojiHandler');

// Authentication using multiple files
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const msgRetryCounterCache = new NodeCache();
const logger = pino({ level: 'silent' });

// Helper function for terminal input
const question = (text) => new Promise((resolve) => rl.question(text, resolve));

async function startBot() {
    // Dynamically import chalk as it's an ES module
    const chalk = (await import('chalk')).default;

    const { state, saveCreds } = await useMultiFileAuthState('auth_info'); // Multi-file auth
    const sock = makeWASocket({
        logger,  // Use pino logger
        printQRInTerminal: true,  // Print QR in terminal
        auth: state,  // Multi-file auth state
        msgRetryCounterCache
    });

    // Bind the credentials saving event
    sock.ev.on('creds.update', saveCreds);

    // Handle connection updates
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const reason = new Boom(lastDisconnect?.error)?.output.statusCode;
            if (reason === DisconnectReason.connectionLost) {
                console.log('Connection to server lost. Reconnecting...');
                startBot();  // Reconnect logic
            } else if (reason === DisconnectReason.loggedOut) {
                console.log('Logged out. Delete session and start over.');
                fs.rmSync('./auth_info', { recursive: true, force: true });  // Delete session folder
                process.exit(1);
            } else {
                console.log('Connection closed. Reconnecting...');
                startBot();  // Reconnect logic
            }
        } else if (connection === 'open') {
            console.log(chalk.greenBright('Connected!'));
        }
    });

    // Message handling
    sock.ev.on('messages.upsert', async ({ messages }) => {
        const message = messages[0];
        const senderId = message.key.remoteJid;
        const content = message.message?.conversation;

        if (content === '.startbot') {
            await sock.sendMessage(senderId, { text: 'Hi 👋, I\'m Paul AI assistant, what\'s your name?' });
        } else if (message.message?.imageMessage) {
            const response = await processImage(message.message.imageMessage);
            await sock.sendMessage(senderId, { text: response });
        } else if (content) {
            let userData = await getUserData(senderId);
            if (!userData) {
                saveUserData(senderId, { name: content, messages: [] });
                await sock.sendMessage(senderId, { text: `Nice, how can I help you today, ${content}?` });
            } else {
                const aiResponse = await getAIResponse(content, userData);
                await sock.sendMessage(senderId, { text: aiResponse });
                saveMessage(senderId, content);
            }
        }
    });
}

startBot();

// Hot-reload mechanism (optional)
let file = require.resolve(__filename);
fs.watchFile(file, () => {
    fs.unwatchFile(file);
    console.log(chalk.redBright(`Reloading ${__filename}`));
    delete require.cache[file];
    require(file);
});
