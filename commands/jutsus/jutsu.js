const fs = require('fs');
const { EmbedBuilder } = require('discord.js');
const config = require('../../config.json');
const banco = require('../../banco.js');

module.exports = {
    nome: '!jutsu',

    executar(message) {
        const args = message.content.trim().split(/ +/);

        if (args.length < 3) {
            return message.reply('⚠️ Use: `!jutsu <elemento> <nome_curto>`\nExemplo: `!jutsu katon goukakyuu`');
        }

        const elementoDigitado = args[1].toLowerCase();
        const jutsuSorteado = args[2].toLowerCase();

        // Verifica se o elemento digitado existe no nosso config.json
        if (!config.cores[elementoDigitado]) {
            return message.reply('❌ Elemento desconhecido. Escolha entre: katon, suiton, fuuton, doton ou raiton.');
        }

        // --------------------------------------------------
        // PASSO 1: LER O BANCO E VERIFICAR A FICHA
        // --------------------------------------------------
        const perfis = banco.ler();
        const idUsuario = message.author.id;

        if (!perfis[idUsuario]) {
            return message.reply('❌ Você precisa criar um perfil primeiro usando `!novo`.');
        }

        const jutsusDoJogador = perfis[idUsuario].jutsusAprendidos[elementoDigitado] || [];
        
        if (!jutsusDoJogador.includes(jutsuSorteado)) {
            return message.reply(`❌ Você ainda não aprendeu essa técnica! Treine usando: \`!aprenderjutsu ${elementoDigitado} ${jutsuSorteado}\``);
        }

        // --------------------------------------------------
        // PASSO 2: PUXAR OS DADOS DO SERVIDOR
        // --------------------------------------------------
        const caminhoArquivo = `./jutsus/${elementoDigitado}.json`;

        if (!fs.existsSync(caminhoArquivo)) {
            return message.reply(`❌ O banco de dados de ${elementoDigitado} não foi encontrado.`);
        }

        const dadosElemento = fs.readFileSync(caminhoArquivo, 'utf-8');
        const listaJutsus = JSON.parse(dadosElemento);

        const jutsu = listaJutsus[jutsuSorteado];

        if (!jutsu) {
            return message.reply('❌ Esse jutsu não existe no banco de dados do servidor.');
        }

        // --------------------------------------------------
        // PASSO 3: MONTAR O VISUAL E LANÇAR
        // --------------------------------------------------
        // Puxa a cor e o emoji dinamicamente do config.json
        const corElemento = config.cores[elementoDigitado];
        const emojiElemento = config.emojis[elementoDigitado];

        const painelJutsu = new EmbedBuilder()
            .setColor(corElemento) 
            .setTitle(`${emojiElemento} ${jutsu.nome}`)
            .setDescription(jutsu.descricao)
            .addFields(
                { name: '📊 Rank', value: jutsu.rank, inline: true },
                { name: '💥 Dano', value: `${jutsu.dano}`, inline: true },
                { name: '🌀 Custo de Chakra', value: `${jutsu.custoChakra}`, inline: true }
            )
            .setImage(jutsu.imagem) 
            .setFooter({ text: `Jutsu lançado por ${message.author.username}` });

        message.reply({ embeds: [painelJutsu] });
    }
};