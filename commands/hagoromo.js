// Puxamos apenas a ferramenta EmbedBuilder, pois é a única que este comando usa
const { EmbedBuilder } = require('discord.js');

module.exports = {
    nome: 'hagoromo',
    
    // O que o comando faz
    executar(message) {
        const painelHagoromo = new EmbedBuilder()
            .setColor('#FF8C00')
            .setTitle('📜 O Sábio dos Seis Caminhos')
            .setDescription('Eu sou **Hagoromo Ōtsutsuki**, o criador do Ninshū. A paz não vem do poder, mas sim da compreensão verdadeira entre as pessoas.')
            .addFields(
                { name: '✨ O Propósito do Chakra', value: 'O chakra deve conectar os corações, não ser usado como arma de destruição.', inline: false },
                { name: '🔥 A Vontade do Fogo', value: 'Aqueles que herdaram meu poder devem proteger o mundo através do amor.', inline: false }
            )
            .setImage('https://i.pinimg.com/1200x/98/6f/27/986f27bc7cac48d7b98c0e75cb69d955.jpg')
            .setFooter({ text: 'O ciclo do ódio pode ser quebrado.' });

        message.reply({ embeds: [painelHagoromo] });
    }
};