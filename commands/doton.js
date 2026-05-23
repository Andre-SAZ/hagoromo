const fs = require('fs');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    nome: '!doton',

    executar(message) {
        const args = message.content.trim().split(/ +/);
        const jutsuSorteado = args[1] ? args[1].toLowerCase() : null;

        if (!jutsuSorteado) {
            return message.reply('⚠️ Você precisa digitar o nome do jutsu! Exemplo: `!doton doryuuhei`');
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

        // Pega a lista de jutsus de TERRA (doton) da pessoa
        const jutsusDoJogador = perfis[idUsuario].jutsusAprendidos.doton || [];
        
        // Verifica se o jogador treinou o jutsu solicitado
        if (!jutsusDoJogador.includes(jutsuSorteado)) {
            return message.reply(`❌ Você ainda não aprendeu essa técnica! Treine primeiro usando: \`!aprenderjutsu doton ${jutsuSorteado}\``);
        }

        // --------------------------------------------------
        // PASSO 2: PUXAR OS DADOS DO SERVIDOR E LANÇAR O JUTSU
        // --------------------------------------------------
        const dadosDoton = fs.readFileSync('./jutsus/doton.json', 'utf-8');
        const listaDoton = JSON.parse(dadosDoton);

        const jutsu = listaDoton[jutsuSorteado];

        if (!jutsu) {
            return message.reply('❌ Esse jutsu de Doton não existe no banco de dados do servidor.');
        }

        // Monta o template visual do ataque
        const painelJutsu = new EmbedBuilder()
            .setColor('#8B4513') // SaddleBrown (Marrom) para combinar com a Terra
            .setTitle(`🪨 ${jutsu.nome}`)
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