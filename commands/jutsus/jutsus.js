const fs = require('fs');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    nome: '!jutsus',

    executar(message) {
        const dadosArquivo = fs.readFileSync('./perfis.json', 'utf-8');
        const perfis = JSON.parse(dadosArquivo);
        const idUsuario = message.author.id;

        if (!perfis[idUsuario]) return message.reply('Crie seu perfil primeiro!');

        const jutsus = perfis[idUsuario].jutsusAprendidos;
        const nomeJogador = perfis[idUsuario].nome;

        const painelJutsus = new EmbedBuilder()
            .setColor('#FF4500')
            .setTitle(`📜 Livro de Jutsus: ${nomeJogador}`)
            .setDescription('Aqui estão as técnicas que você dominou até agora:');

        // Checa elemento por elemento. Se tiver algum jutsu na lista, ele adiciona no cartão
        if (jutsus.katon.length > 0) {
            painelJutsus.addFields({ name: '🔥 Katon (Fogo)', value: jutsus.katon.join('\n'), inline: true });
        }
        if (jutsus.fuuton.length > 0) {
            painelJutsus.addFields({ name: '🌪️ Fuuton (Vento)', value: jutsus.fuuton.join('\n'), inline: true });
        }
        if (jutsus.doton.length > 0) {
            painelJutsus.addFields({ name: '🪨 Doton (Terra)', value: jutsus.doton.join('\n'), inline: true });
        }
        if (jutsus.raiton.length > 0) {
            painelJutsus.addFields({ name: '⚡ Raiton (Raio)', value: jutsus.raiton.join('\n'), inline: true });
        }
        if (jutsus.suiton.length > 0) {
            painelJutsus.addFields({ name: '💧 Suiton (Água)', value: jutsus.suiton.join('\n'), inline: true });
        }
        if (jutsus.outros.length > 0) {
            painelJutsus.addFields({ name: '✨ Outros / Neutro', value: jutsus.outros.join('\n'), inline: true });
        }

        // Se a pessoa ainda não tem nada, avisa
        if (painelJutsus.data.fields === undefined) {
            painelJutsus.setDescription('Você ainda não aprendeu nenhum Jutsu. Use o comando `!aprenderjutsu`.');
        }

        message.reply({ embeds: [painelJutsus] });
    }
};