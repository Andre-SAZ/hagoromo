const { EmbedBuilder } = require('discord.js');
const banco = require('../../banco.js'); // Ajuste o caminho se necessário

module.exports = {
    nome: '!bloquear',

    async executar(message) {
        // Exige que se marque o atacante para comparar Força vs Defesa
        const alvo = message.mentions.members.first();
        if (!alvo) {
            return message.reply('⚠️ Precisas de marcar o adversário! Exemplo: `!bloquear @atacante`');
        }

        const perfis = banco.ler();
        const idDefensor = message.author.id;
        const idAtacante = alvo.id;

        const dadosDefensor = perfis[idDefensor];
        const dadosAtacante = perfis[idAtacante];

        if (!dadosDefensor || !dadosAtacante) {
            return message.reply('❌ Para haver combate, ambos os jogadores precisam de ter fichas registadas (`!novo`).');
        }

        // Lê os atributos. Se não existirem, assume o valor base de 5.
        const defesaDefensor = dadosDefensor.defesa || 5;
        const forcaAtacante = dadosAtacante.forca || 5;

        // ==========================================
        // MATEMÁTICA DO BLOQUEIO
        // ==========================================
        // Base de 50% + 5% por cada ponto de vantagem na defesa
        let reducaoDano = 50 + ((defesaDefensor - forcaAtacante) * 5);

        // Travas do sistema
        if (reducaoDano > 100) reducaoDano = 100; // Máximo é anular tudo (Bloqueio Perfeito)
        if (reducaoDano < 10) reducaoDano = 10;   // Mínimo é mitigar 10% (Quase Guarda Quebrada)

        // ==========================================
        // MONTAGEM DA RESPOSTA NO CHAT
        // ==========================================
        const embedBloqueio = new EmbedBuilder().setTitle('🛡️ Postura Defensiva');

        // Cenário 1: Bloqueio Perfeito (100% de Redução)
        if (reducaoDano === 100) {
            embedBloqueio.setColor('#FFD700'); // Dourado
            embedBloqueio.setDescription(`**BLOQUEIO PERFEITO!**\nA postura de **${dadosDefensor.nome}** é inabalável. A diferença de poder é tanta que o ataque de **${dadosAtacante.nome}** choca contra a defesa como se batesse numa parede de ferro, não causando nenhum arranhão!`);
            embedBloqueio.setImage('https://media.tenor.com/T_A8nN9-zGEAAAAC/boruto-naruto.gif');
        } 
        // Cenário 2: Bloqueio Sólido (50% a 99%)
        else if (reducaoDano >= 50) {
            embedBloqueio.setColor('#3498DB'); // Azul
            embedBloqueio.setDescription(`**${dadosDefensor.nome}** firma os pés no chão e ergue os braços, conseguindo absorver e resistir a grande parte do impacto do golpe de **${dadosAtacante.nome}**.`);
            embedBloqueio.setImage('https://media.tenor.com/3Z4h7q-3x00AAAAC/neji-hyuga-byakugan.gif');
        } 
        // Cenário 3: Guarda Quase Quebrada (Menos de 50%)
        else {
            embedBloqueio.setColor('#E67E22'); // Laranja
            embedBloqueio.setDescription(`**${dadosDefensor.nome}** tentou defender-se, mas a força bruta de **${dadosAtacante.nome}** foi esmagadora! A guarda cedeu sob a pressão pesada do ataque.`);
            embedBloqueio.setImage('https://media.tenor.com/M6LnsM4oOiwAAAAC/naruto-pain.gif');
        }

        // Adiciona a informação técnica para os jogadores calcularem o dano
        embedBloqueio.addFields(
            { name: '📉 Mitigação de Dano', value: `Reduziu o dano sofrido em **${reducaoDano}%**`, inline: true },
            { name: '📊 Comparativo', value: `Defesa (\`${defesaDefensor}\`) vs Força (\`${forcaAtacante}\`)`, inline: true }
        );

        await message.reply({ embeds: [embedBloqueio] });
    }
};