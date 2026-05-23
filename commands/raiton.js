const fs = require('fs');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    nome: '!raiton',

    executar(message) {
        const args = message.content.trim().split(/ +/);
        const jutsuSorteado = args[1] ? args[1].toLowerCase() : null;

        if (!jutsuSorteado) {
            return message.reply('⚠️ Você precisa digitar o nome do jutsu! Exemplo: `!raiton chidori`');
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

        // Pega a lista de jutsus de RAIO (raiton) da pessoa
        const jutsusDoJogador = perfis[idUsuario].jutsusAprendidos.raiton || [];
        
        // Verifica se o jogador treinou o jutsu
        if (!jutsusDoJogador.includes(jutsuSorteado)) {
            return message.reply(`❌ Você ainda não aprendeu essa técnica! Treine primeiro usando: \`!aprenderjutsu raiton ${jutsuSorteado}\``);
        }

        // --------------------------------------------------
        // PASSO 2: PUXAR OS DADOS DO SERVIDOR E LANÇAR O JUTSU
        // --------------------------------------------------
        const dadosRaiton = fs.readFileSync('./jutsus/raiton.json', 'utf-8');
        const listaRaiton = JSON.parse(dadosRaiton);

        const jutsu = listaRaiton[jutsuSorteado];

        if (!jutsu) {
            return message.reply('❌ Esse jutsu de Raiton não existe no banco de dados do servidor.');
        }

        // Monta o template visual do ataque
        const painelJutsu = new EmbedBuilder()
            .setColor('#FFD700') // Amarelo/Dourado para combinar com o Raio
            .setTitle(`⚡ ${jutsu.nome}`)
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