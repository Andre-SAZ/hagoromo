const fs = require('fs');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    nome: '!suiton',

    executar(message) {
        const args = message.content.trim().split(/ +/);
        const jutsuSorteado = args[1] ? args[1].toLowerCase() : null;

        if (!jutsuSorteado) {
            return message.reply('⚠️ Você precisa digitar o nome do jutsu! Exemplo: `!suiton mizurappa`');
        }

        // --------------------------------------------------
        // PASSO 1: VERIFICAR A FICHA DO JOGADOR
        // --------------------------------------------------
        const dadosArquivo = fs.readFileSync('./perfis.json', 'utf-8');
        const perfis = JSON.parse(dadosArquivo);
        const idUsuario = message.author.id;

        if (!perfis[idUsuario]) {
            return message.reply('❌ Você precisa criar um perfil primeiro usando `!novo`.');
        }

        // Pesta a lista de jutsus de ÁGUA (suiton) da pessoa
        const jutsusDoJogador = perfis[idUsuario].jutsusAprendidos.suiton || [];
        
        // Verifica se o jogador treinou o jutsu solicitado
        if (!jutsusDoJogador.includes(jutsuSorteado)) {
            return message.reply(`❌ Você ainda não aprendeu essa técnica! Treine primeiro usando: \`!aprenderjutsu suiton ${jutsuSorteado}\``);
        }

        // --------------------------------------------------
        // PASSO 2: PUXAR OS DADOS DO SERVIDOR E LANÇAR O JUTSU
        // --------------------------------------------------
        const dadosSuiton = fs.readFileSync('./jutsus/suiton.json', 'utf-8');
        const listaSuiton = JSON.parse(dadosSuiton);

        const jutsu = listaSuiton[jutsuSorteado];

        if (!jutsu) {
            return message.reply('❌ Esse jutsu de Suiton não existe no banco de dados do servidor.');
        }

        // Monta o template visual do ataque
        const painelJutsu = new EmbedBuilder()
            .setColor('#00BFFF') // Azul claro/Deep Sky Blue para combinar com Água
            .setTitle(`💧 ${jutsu.nome}`)
            .setDescription(jutsu.descricao)
            .addFields(
                { name: '📊 Rank', value: jutsu.rank, inline: true },
                { name: '💥 Dano', value: `${jutsu.dano}`, inline: true },
                { name: '🌀 Custo de Chakra', value: `${jutsu.custoChakra}`, inline: true }
            )
            .setImage(jutsu.imagem) 
            .setFooter({ text: `Jutsu lançado por ${message.author.username}` });

        // Lança o ataque no chat
        message.reply({ embeds: [painelJutsu] });
    }
};