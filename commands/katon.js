const fs = require('fs');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    nome: '!katon',

    executar(message) {
        const args = message.content.trim().split(/ +/);
        const jutsuSorteado = args[1] ? args[1].toLowerCase() : null;

        if (!jutsuSorteado) {
            return message.reply('⚠️ Você precisa digitar o nome do jutsu! Exemplo: `!katon goukakyuu`');
        }

        // --------------------------------------------------
        // PASSO 1: VERIFICAR A FICHA DO JOGADOR
        // --------------------------------------------------
        const dadosArquivo = fs.readFileSync('./perfis.json', 'utf-8');
        const perfis = JSON.parse(dadosArquivo);
        const idUsuario = message.author.id;

        // Confere se o jogador tem uma ficha
        if (!perfis[idUsuario]) {
            return message.reply('❌ Você precisa criar um perfil primeiro usando `!novo`.');
        }

        // Pega a lista de jutsus de fogo da pessoa (se estiver vazio, cria uma lista vazia para não dar erro)
        const jutsusDoJogador = perfis[idUsuario].jutsusAprendidos.katon || [];
        
        // A TRAVA: Verifica se o nome curto digitado está dentro da lista do jogador
        if (!jutsusDoJogador.includes(jutsuSorteado)) {
            return message.reply(`❌ Você ainda não aprendeu essa técnica! Treine primeiro usando: \`!aprenderjutsu katon ${jutsuSorteado}\``);
        }

        // --------------------------------------------------
        // PASSO 2: PUXAR OS DADOS DO SERVIDOR E LANÇAR O JUTSU
        // --------------------------------------------------
        const dadosKaton = fs.readFileSync('./jutsus/katon.json', 'utf-8');
        const listaKaton = JSON.parse(dadosKaton);

        const jutsu = listaKaton[jutsuSorteado];

        // Só por segurança, checamos se o jutsu existe no servidor
        if (!jutsu) {
            return message.reply('❌ Esse jutsu de Katon não existe no banco de dados do servidor.');
        }

        // Monta o template visual do ataque
        const painelJutsu = new EmbedBuilder()
            .setColor('#FF0000') 
            .setTitle(`🔥 ${jutsu.nome}`)
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