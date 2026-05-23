const fs = require('fs');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    nome: '!status',

    executar(message) {
        const dadosArquivo = fs.readFileSync('./perfis.json', 'utf-8');
        const perfis = JSON.parse(dadosArquivo);
        const idUsuario = message.author.id;

        if (!perfis[idUsuario]) {
            return message.reply('Você ainda não tem um perfil! Use o comando `!novo` primeiro.');
        }

        const dadosUsuario = perfis[idUsuario];

        const perfilNinja = new EmbedBuilder()
            .setColor('#0099FF')
            .setTitle(`🥷 Registro Ninja: ${dadosUsuario.nome}`)
            .setThumbnail(message.author.displayAvatarURL({ dynamic: true, size: 256 }))
            .setImage(dadosUsuario.imagem) // Aqui o bot carrega a foto do personagem
            .addFields(
                { name: '⛩️ Clã', value: dadosUsuario.cla, inline: true },
                { name: '⏳ Idade', value: dadosUsuario.idade, inline: true },
                { name: '💰 Ryōs', value: `${dadosUsuario.ryos}`, inline: true },
                
                { name: '❤️ Vida', value: `${dadosUsuario.vidaAtual} / ${dadosUsuario.vidaMaxima}`, inline: true },
                { name: '🌀 Chakra', value: `${dadosUsuario.chakraAtual} / ${dadosUsuario.chakraMaxima}`, inline: true },
                { name: '\u200B', value: '\u200B', inline: true },
                
                { name: '💪 Força', value: `${dadosUsuario.forca}`, inline: true },
                { name: '🏃 Agilidade', value: `${dadosUsuario.agilidade}`, inline: true },
                { name: '🛡️ Defesa', value: `${dadosUsuario.defesa}`, inline: true },
                
                { name: '🌪️ Elementos', value: dadosUsuario.elementos, inline: false },
                { name: '🧬 Kekkei-Genkai', value: dadosUsuario.kekkei, inline: false },
                { name: '⚔️ Maestrias', value: dadosUsuario.maestrias, inline: false }
            )
            .setFooter({ text: `Perfil de ${message.author.username}` });

        message.reply({ embeds: [perfilNinja] });
    }
};