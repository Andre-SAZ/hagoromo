const fs = require('fs');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    nome: '!fuuton',

    executar(message) {
        const args = message.content.trim().split(/ +/);
        const jutsuSorteado = args[1] ? args[1].toLowerCase() : null;

        if (!jutsuSorteado) {
            return message.reply('⚠️ Você precisa digitar o nome do jutsu! Exemplo: `!fuuton kamaitachi`');
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

        // Pega a lista de jutsus de VENTO (fuuton) da pessoa
        const jutsusDoJogador = perfis[idUsuario].jutsusAprendidos.fuuton || [];
        
        // Verifica se o jogador treinou o jutsu
        if (!jutsusDoJogador.includes(jutsuSorteado)) {
            return message.reply(`❌ Você ainda não aprendeu essa técnica! Treine primeiro usando: \`!aprenderjutsu fuuton ${jutsuSorteado}\``);
        }

        // --------------------------------------------------
        // PASSO 2: PUXAR OS DADOS DO SERVIDOR E LANÇAR O JUTSU
        // --------------------------------------------------
        const dadosFuuton = fs.readFileSync('./jutsus/fuuton.json', 'utf-8');
        const listaFuuton = JSON.parse(dadosFuuton);

        const jutsu = listaFuuton[jutsuSorteado];

        if (!jutsu) {
            return message.reply('❌ Esse jutsu de Fuuton não existe no banco de dados do servidor.');
        }

        // Monta o template visual do ataque
        const painelJutsu = new EmbedBuilder()
            .setColor('#00FF7F') // Cor verde clara para combinar com Vento
            .setTitle(`🌪️ ${jutsu.nome}`)
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