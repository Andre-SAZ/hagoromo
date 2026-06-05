const { EmbedBuilder } = require('discord.js');
const banco = require('../../banco.js'); // Lembre-se de ajustar a quantidade de ../ conforme a pasta

module.exports = {
    nome: '!desviar',

    async executar(message) {
        // Exige que o jogador marque de quem está desviando para o bot saber de qual ficha puxar a Agilidade
        const alvo = message.mentions.members.first();
        if (!alvo) {
            return message.reply('⚠️ Você precisa marcar o adversário! Exemplo: `!desviar @atacante`');
        }

        const perfis = banco.ler();
        const idDefensor = message.author.id;
        const idAtacante = alvo.id;

        const dadosDefensor = perfis[idDefensor];
        const dadosAtacante = perfis[idAtacante];

        if (!dadosDefensor || !dadosAtacante) {
            return message.reply('❌ Para haver combate, ambos os jogadores precisam ter fichas cadastradas (`!novo`).');
        }

        // Caso a ficha não tenha a variável agilidade definida ainda, assume o valor base 5
        const agilidadeDefensor = dadosDefensor.agilidade || 5;
        const agilidadeAtacante = dadosAtacante.agilidade || 5;

        // ==========================================
        // MATEMÁTICA DA ESQUIVA
        // ==========================================
        let chanceEsquiva = 50 + ((agilidadeDefensor - agilidadeAtacante) * 5);

        // Travas do sistema (Mínimo de 10% e Máximo de 90%)
        if (chanceEsquiva > 90) chanceEsquiva = 90;
        if (chanceEsquiva < 10) chanceEsquiva = 10;

        // Sorteia um número aleatório de 1 a 100 (O dado D100 do bot)
        const dadoRolado = Math.floor(Math.random() * 100) + 1;
        
        // Se o dado cair num número MENOR ou IGUAL a sua chance, é sucesso
        const sucesso = dadoRolado <= chanceEsquiva;

        // ==========================================
        // MONTAGEM DA RESPOSTA NO CHAT
        // ==========================================
        const embedEsquiva = new EmbedBuilder()
            .setTitle('💨 Tentativa de Esquiva')
            .addFields(
                { name: '📊 Sua Chance de Sucesso', value: `${chanceEsquiva}%`, inline: true },
                { name: '🎲 Dado Rolado (D100)', value: `${dadoRolado}`, inline: true }
            );

        if (sucesso) {
            embedEsquiva.setColor('#2ECC71'); // Cor Verde para Sucesso
            embedEsquiva.setDescription(`**${dadosDefensor.nome}** leu os movimentos com precisão, foi mais rápido que **${dadosAtacante.nome}** e conseguiu desviar graciosamente do ataque!\n\n*(Nenhum dano sofrido).*`);
            embedEsquiva.setImage('https://media.tenor.com/7Hovn9W4B2IAAAAC/naruto-sasuke.gif');
        } else {
            embedEsquiva.setColor('#E74C3C'); // Cor Vermelha para Falha
            embedEsquiva.setDescription(`**${dadosDefensor.nome}** tentou prever o golpe, mas a investida de **${dadosAtacante.nome}** foi rápida demais! A esquiva falhou e o golpe acertou em cheio.`);
            embedEsquiva.setImage('https://media.tenor.com/XqTj9eQ-bN0AAAAC/naruto-punch.gif');
        }

        await message.reply({ embeds: [embedEsquiva] });
    }
};