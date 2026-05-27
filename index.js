// ==========================================
// IMPORTAÇÕES E CONFIGURAÇÕES INICIAIS
// ==========================================
require('dotenv').config();
const fs = require('fs'); // Ferramenta do Node para ler arquivos do computador
const { Client, GatewayIntentBits, Events, Collection } = require('discord.js');

// ==========================================
// CRIANDO O BOT E AS PERMISSÕES
// ==========================================
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// Criamos um espaço na memória para guardar nossos comandos
client.commands = new Collection();

// ==========================================
// LENDO A PASTA 'commands'
// ==========================================
// Lê todos os arquivos dentro de 'commands' que terminam em '.js'
const arquivosComandos = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

// Salva cada comando na memória do bot
for (const arquivo of arquivosComandos) {
    const comando = require(`./commands/${arquivo}`);
    client.commands.set(comando.nome, comando);
}

// ==========================================
// EVENTOS DO BOT
// ==========================================

// Evento: Bot ligou
client.once(Events.ClientReady, (readyClient) => {
    console.log(`🍃 Sucesso! O bot ${readyClient.user.tag} está online e protegendo a vila!`);
});

// ==========================================
// EVENTO: ALGUÉM ENVIOU UMA MENSAGEM
// ==========================================
client.on(Events.MessageCreate, async (message) => {
    
    // Ignora outros bots
    if (message.author.bot) return;

    // Pega a primeira palavra do texto para saber qual é o comando
    const args = message.content.trim().split(/ +/);
    const nomeComando = args[0].toLowerCase();

    // Procura o comando na nossa lista salva na memória
    const comando = client.commands.get(nomeComando);

    // Se a palavra não for um comando nosso, o bot ignora e não faz nada
    if (!comando) return;

    // Tenta rodar o comando (AGORA COM AWAIT PARA COMANDOS ASSÍNCRONOS)
    try {
        await comando.executar(message);
    } catch (erro) {
        console.error('[ERRO CRÍTICO NO COMANDO]:', erro);
        message.reply('❌ Ocorreu um erro fatal ao executar este comando.');
    }
});

// ==========================================
// LOGIN DO BOT
// ==========================================
client.login(process.env.TOKEN_DO_BOT);