const { EmbedBuilder } = require('discord.js');

module.exports = {
    nome: '!help',

    executar(message) {
        let listaGeral = [];
        let listaElementos = [];
        const comandosDeElemento = ['!katon', '!suiton', '!doton', '!raiton', '!fuuton'];

        // Lê os comandos diretamente da memória do Client do Discord
        message.client.commands.forEach(comando => {
            if (!comando.nome) return;

            if (comandosDeElemento.includes(comando.nome)) {
                listaElementos.push(`\`${comando.nome} <nome_curto>\``);
            } else {
                listaGeral.push(`\`${comando.nome}\``);
            }
        });

        const painelHelp = new EmbedBuilder()
            .setColor('#2F3136')
            .setTitle('📜 Pergaminho de Comandos')
            .setDescription('Aqui estão todos os comandos disponíveis no servidor.')
            .addFields(
                { 
                    name: '🛠️ Comandos de Utilidade e RPG', 
                    value: listaGeral.join(' | ') || 'Nenhum comando encontrado.', 
                    inline: false 
                },
                { 
                    name: '⚔️ Como lançar Jutsus', 
                    value: 'Use o comando do seu elemento seguido pelo nome curto do jutsu.\n\n**Sintaxe:**\n' + listaElementos.join('\n') + '\n\n*Exemplo: `!jutsu katon goukakyuu`*', 
                    inline: false 
                }
            )
            .setFooter({ text: 'Dica: Use !jutsus para ver quais técnicas você já aprendeu.' });

        message.reply({ embeds: [painelHelp] });
    }
};