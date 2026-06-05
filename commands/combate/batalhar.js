const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const banco = require('../../banco.js');
const batalhasAtivas = require('../../gerenciadorBatalhas.js'); // Ajuste o caminho conforme necessário

module.exports = {
    nome: '!batalhar',

    async executar(message) {
        const alvo = message.mentions.users.first();
        const idDesafiante = message.author.id;

        // Validações Básicas
        if (!alvo) {
            return message.reply('⚠️ Precisas de marcar o jogador que queres desafiar! Ex: `!batalhar @fulano`');
        }
        if (alvo.id === idDesafiante) {
            return message.reply('❌ Não podes lutar contra ti mesmo!');
        }
        if (alvo.bot) {
            return message.reply('❌ Não podes desafiar o bot para uma luta!');
        }

        // Verifica se alguém já está numa batalha
        if (batalhasAtivas.has(idDesafiante)) {
            return message.reply('⚠️ Tu já estás numa batalha! Termina-a ou foge primeiro.');
        }
        if (batalhasAtivas.has(alvo.id)) {
            return message.reply(`⚠️ O jogador **${alvo.username}** já está numa batalha no momento.`);
        }

        const perfis = banco.ler();
        const fichaDesafiante = perfis[idDesafiante];
        const fichaAlvo = perfis[alvo.id];

        if (!fichaDesafiante) return message.reply('❌ Tu precisas de ter uma ficha ninja (`!novo`).');
        if (!fichaAlvo) return message.reply(`❌ O jogador **${alvo.username}** não tem uma ficha ninja.`);

        // Configura o painel de desafio
        const embedDesafio = new EmbedBuilder()
            .setColor('#E74C3C')
            .setTitle('⚔️ Desafio de Combate Shinobi')
            .setDescription(`**${alvo.username}**, foste desafiado por **${message.author.username}** para um combate! Aceitas o desafio?`)
            .setFooter({ text: 'Tens 60 segundos para responder.' });

        const botoes = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('aceitar_luta').setLabel('✅ Aceitar').setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId('recusar_luta').setLabel('❌ Recusar').setStyle(ButtonStyle.Danger)
        );

        const msgDesafio = await message.channel.send({ content: `<@${alvo.id}>`, embeds: [embedDesafio], components: [botoes] });

        // Coletor que apenas o alvo pode clicar
        const filtro = (interacao) => interacao.user.id === alvo.id;
        const coletor = msgDesafio.createMessageComponentCollector({ filter, time: 60000 });

        coletor.on('collect', async (interacao) => {
            if (interacao.customId === 'recusar_luta') {
                await interacao.update({ content: `💨 **${alvo.username}** recusou o combate.`, embeds: [], components: [] });
                return coletor.stop();
            }

            if (interacao.customId === 'aceitar_luta') {
                // ==========================================
                // LÓGICA DE INICIATIVA (Quem ataca primeiro?)
                // ==========================================
                // Soma a agilidade com um dado de 20 lados (d20) para dar fator surpresa
                const rollDesafiante = Math.floor(Math.random() * 20) + 1;
                const rollAlvo = Math.floor(Math.random() * 20) + 1;

                const agilidadeDesafiante = (fichaDesafiante.agilidade || 0) + rollDesafiante;
                const agilidadeAlvo = (fichaAlvo.agilidade || 0) + rollAlvo;

                let idPrimeiro, idSegundo, nomePrimeiro;

                if (agilidadeDesafiante >= agilidadeAlvo) {
                    idPrimeiro = idDesafiante;
                    idSegundo = alvo.id;
                    nomePrimeiro = message.author.username;
                } else {
                    idPrimeiro = alvo.id;
                    idSegundo = idDesafiante;
                    nomePrimeiro = alvo.username;
                }

                // Cria o "Quarto" da Batalha na memória do bot
                const idBatalha = `batalha_${idDesafiante}_${alvo.id}`;
                const dadosBatalha = {
                    id: idBatalha,
                    atacanteAtual: idPrimeiro,
                    defensorAtual: idSegundo,
                    fase: 'ATAQUE', // Alterna entre 'ATAQUE' e 'DEFESA'
                    danoPendente: 0,
                    custoChakraPendente: 0,
                    jutsuPendenteTexto: '',
                    historico: []
                };

                // Tranca os dois jogadores na mesma sala
                batalhasAtivas.set(idDesafiante, dadosBatalha);
                batalhasAtivas.set(alvo.id, dadosBatalha);

                const embedInicio = new EmbedBuilder()
                    .setColor('#3498DB')
                    .setTitle('🔥 A Batalha Começou! 🔥')
                    .setDescription(`Os olhares cruzaram-se e a luta teve início!\n\n**Iniciativa:**\n💨 ${message.author.username}: \`${agilidadeDesafiante}\` *(Agilidade + Dado)*\n💨 ${alvo.username}: \`${agilidadeAlvo}\` *(Agilidade + Dado)*\n\n🎯 O combate segue em turnos. Interpreta as tuas ações no chat!`)
                    .addFields({ 
                        name: `➡️ Turno de ATAQUE de: ${nomePrimeiro}`, 
                        value: `Usa o teu texto de Roleplay e depois o comando do ataque, ex:\n\`!usarjutsu <categoria> <nome_curto>\` ou \`!soco\`` 
                    });

                await interacao.update({ content: `<@${idPrimeiro}>`, embeds: [embedInicio], components: [] });
                coletor.stop();
            }
        });

        coletor.on('end', (collected, reason) => {
            if (reason === 'time') {
                msgDesafio.edit({ content: `⏳ O tempo limite para **${alvo.username}** aceitar a luta esgotou.`, embeds: [], components: [] }).catch(() => {});
            }
        });
    }
};