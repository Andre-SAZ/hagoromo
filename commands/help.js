const fs = require('fs');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    nome: '!help',

    executar(message) {
        // Lê todos os arquivos que terminam com .js dentro da pasta commands
        const arquivosComandos = fs.readdirSync('./commands').filter(arquivo => arquivo.endsWith('.js'));

        let listaGeral = [];
        let listaElementos = [];

        // Lista dos comandos que funcionam como templates de ataque
        const comandosDeElemento = ['!katon', '!suiton', '!doton', '!raiton', '!fuuton'];

        for (const arquivo of arquivosComandos) {
            const comando = require(`./${arquivo}`);
            
            // Se o arquivo não tiver a propriedade "nome", ele pula
            if (!comando.nome) continue;

            // Separa os comandos de ataque dos comandos normais
            if (comandosDeElemento.includes(comando.nome)) {
                listaElementos.push(`\`${comando.nome} <nome_curto>\``);
            } else {
                listaGeral.push(`\`${comando.nome}\``);
            }
        }

        const painelHelp = new EmbedBuilder()
            .setColor('#2F3136') // Cor neutra padrão do Discord
            .setTitle('📜 Pergaminho de Comandos')
            .setDescription('Aqui estão todos os comandos disponíveis no servidor. Esta lista se atualiza automaticamente!')
            .addFields(
                { 
                    name: '🛠️ Comandos de Utilidade e RPG', 
                    value: listaGeral.join(' | ') || 'Nenhum comando encontrado.', 
                    inline: false 
                },
                { 
                    name: '⚔️ Como lançar Jutsus', 
                    value: 'Para lançar um ataque no chat, use o comando do seu elemento seguido pelo nome curto do jutsu.\n\n**Sintaxe dos elementos:**\n' + listaElementos.join('\n') + '\n\n*Exemplo de uso: `!jutsu katon goukakyuu`*', 
                    inline: false 
                }
            )
            .setFooter({ text: 'Dica: Use !jutsus para ver quais técnicas você já aprendeu.' });

        message.reply({ embeds: [painelHelp] });
    }
};