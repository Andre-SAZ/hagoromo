const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const banco = require('../../banco.js');

module.exports = {
    nome: '!status',

    async executar(message) {
        const perfis = banco.ler();
        
        // Define de quem é o status: do membro mencionado OU de quem enviou o comando
        const alvo = message.mentions.members.first() || message.member;
        const idUsuario = alvo.id;
        const dados = perfis[idUsuario];

        // Se o banco não achar a ficha
        if (!dados) {
            // Verifica se a pessoa tentou ver o próprio status ou o de outro
            if (idUsuario === message.author.id) {
                return message.reply('❌ Você ainda não possui um perfil criado! Use `!novo` para começar sua história.');
            } else {
                return message.reply(`❌ O jogador **${alvo.user.username}** ainda não possui um perfil ninja criado.`);
            }
        }

        // ==========================================
        // PÁGINA 1: INFORMAÇÕES PRINCIPAIS E ATRIBUTOS
        // ==========================================
        const gerarEmbedPagina1 = () => {
            const exibicaoElementos = dados.elementos && dados.elementos.length > 0 
                ? dados.elementos.map(e => e.charAt(0).toUpperCase() + e.slice(1).toLowerCase()).join(', ') 
                : 'Nenhum';

            return new EmbedBuilder()
                .setColor('#F1C40F')
                .setTitle(`🥷 Ficha Shinobi - ${dados.nome}`)
                .setImage(dados.imagem || null)
                .addFields(
                    { name: '⛩️ Clã', value: `${dados.cla}`, inline: true },
                    { name: '📊 Rank', value: `\`${dados.rank || 'Rank E'}\``, inline: true },
                    { name: '🎂 Idade', value: `${dados.idade} anos`, inline: true },
                    { name: '🌟 Talento Inato', value: dados.prodigio ? 'Prodígio' : 'Comum', inline: true },
                    { name: '🥋 Estilo de Luta', value: `${dados.estiloLuta || 'Básico'}`, inline: true },
                    { name: '💰 Ryōs', value: `💵 ${dados.ryos || 0}`, inline: true },
                    { name: '❤️ Vida', value: `\`${dados.vidaAtual}/${dados.vidaMaxima}\``, inline: true },
                    { name: '🌀 Chakra', value: `\`${dados.chakraAtual}/${dados.chakraMaxima}\``, inline: true },
                    { name: '✨ Elementos', value: exibicaoElementos, inline: true },
                    { name: '💪 Força', value: `\`${dados.forca || 0}\``, inline: true },
                    { name: '⚡ Agilidade', value: `\`${dados.agilidade || 0}\``, inline: true },
                    { name: '🛡️ Defesa', value: `\`${dados.defesa || 0}\``, inline: true },
                    { name: '👁️ Dōjutsu', value: `${dados.doujutsu || 'Nenhum'}`, inline: true },
                    { name: '🧪 Kekkei Genkai', value: `${dados.kekkei || 'Nenhuma'}`, inline: true },
                    { name: '🌑 Hiden', value: `${dados.hiden || 'Nenhum'}`, inline: true }
                )
                .setFooter({ text: 'Página 1/2 • O painel expira em 60 segundos.' });
        };

        // ==========================================
        // PÁGINA 2: MAESTRIAS EM NÍVEL NUMÉRICO
        // ==========================================
        const gerarEmbedPagina2 = () => {
            let textoMaestrias = [];
            const mapaNomesMaestrias = {
                ninjutsu: 'Ninjutsu', genjutsu: 'Genjutsu', taijutsu: 'Taijutsu',
                bunshinjutsu: 'Bunshinjutsu', fluxoDeChakra: 'Fluxo de Chakra', fuuinjutsu: 'Fuuinjutsu',
                hiden: 'Hiden', juinjutsu: 'Juinjutsu', jujutsu: 'Jujutsu', kekkaijutsu: 'Kekkaijutsu',
                kenjutsu: 'Kenjutsu', kinjutsu: 'Kinjutsu', konbijutsu: 'Konbijutsu', kyuuinjutsu: 'Kyuuinjutsu',
                ninjutsuEspacoTempo: 'Ninjutsu Espaço-Tempo', ninjutsuMedico: 'Ninjutsu Médico', 
                nintaijutsu: 'Nintaijutsu', senjutsu: 'Senjutsu', shurikenjutsu: 'Shurikenjutsu', tenseijutsu: 'Tenseijutsu'
            };

            if (dados.maestrias) {
                for (const [chave, nivel] of Object.entries(dados.maestrias)) {
                    if (nivel > 0) {
                        const nomeFormatado = mapaNomesMaestrias[chave] || chave;
                        textoMaestrias.push(`• **${nomeFormatado}:** Nível \`${nivel}\``);
                    }
                }
            }

            const conteudoMaestrias = textoMaestrias.length > 0 ? textoMaestrias.join('\n') : 'Nenhuma maestria registrada.';

            return new EmbedBuilder()
                .setColor('#9B59B6')
                .setTitle(`📜 Registro de Maestrias - ${dados.nome}`)
                .setThumbnail(dados.imagem || null)
                .setDescription(conteudoMaestrias)
                .setFooter({ text: 'Página 2/2 • O painel expira em 60 segundos.' });
        };

        // Componentes de botões ativos
        const botoesNav = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('status_pag1').setLabel('⬅️ Atributos').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId('status_pag2').setLabel('Maestrias ➡️').setStyle(ButtonStyle.Primary)
        );

        // Envia a mensagem inicial com a Página 1
        const msgStatus = await message.reply({ embeds: [gerarEmbedPagina1()], components: [botoesNav] });

        // Coletor de interações por componentes (Deixa APENAS quem enviou o comando clicar nos botões)
        const filter = (i) => i.user.id === message.author.id;
        const coletor = msgStatus.createMessageComponentCollector({ filter, time: 60000 }); // 60 segundos ativo

        coletor.on('collect', async (interacao) => {
            if (interacao.customId === 'status_pag1') {
                await interacao.update({ embeds: [gerarEmbedPagina1()] });
            } else if (interacao.customId === 'status_pag2') {
                await interacao.update({ embeds: [gerarEmbedPagina2()] });
            }
        });

        // Evento disparado quando os 60 segundos acabam
        coletor.on('end', () => {
            const botoesDesativados = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('status_pag1').setLabel('Atributos').setStyle(ButtonStyle.Secondary).setDisabled(true),
                new ButtonBuilder().setCustomId('status_pag2').setLabel('Maestrias').setStyle(ButtonStyle.Secondary).setDisabled(true)
            );

            msgStatus.edit({ components: [botoesDesativados] }).catch(() => {});
        });
    }
};