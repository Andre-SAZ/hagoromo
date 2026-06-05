// ==========================================
// IMPORTAÇÕES E CONFIGURAÇÕES INICIAIS
// ==========================================
require('dotenv').config();
const fs = require('fs'); // Ferramenta do Node para ler arquivos do computador
const { Client, GatewayIntentBits, Events, Collection, EmbedBuilder } = require('discord.js');
const banco = require('./banco.js'); // Necessário para checar a ficha nos golpes dinâmicos

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
// LENDO AS SUBPASTAS DE COMANDOS
// ==========================================
// Lê tudo o que tem dentro da pasta 'commands' (que agora serão as subpastas)
const pastasComandos = fs.readdirSync('./commands');

for (const pasta of pastasComandos) {
    const caminhoPasta = `./commands/${pasta}`;
    
    // Verifica se o item lido é realmente uma pasta
    if (fs.lstatSync(caminhoPasta).isDirectory()) {
        const arquivosComandos = fs.readdirSync(caminhoPasta).filter(file => file.endsWith('.js'));
        
        for (const arquivo of arquivosComandos) {
            const comando = require(`./commands/${pasta}/${arquivo}`);
            client.commands.set(comando.nome, comando);
        }
    }
}

// ==========================================
// CRIADOR DE COMANDOS DINÂMICOS (TAIJUTSU)
// ==========================================
require('./gerenciadorTaijutsu.js')(client);

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

    // TRAVA DE SEGURANÇA: A mensagem TEM que começar com "!"
    if (!message.content.startsWith('!')) return;

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