const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const banco = require('../banco.js');
const config = require('../config.json');

module.exports = {
    nome: '!status',

    async executar(message) {
        const perfis = banco.ler();
        const dados = perfis[message.author.id];

        if (!dados) {
            return message.reply('❌ Você ainda não tem um perfil! Crie um usando `!novo`.');
        }

        // ==========================================
        // PÁGINA 1: STATUS DE COMBATE
        // ==========================================
        const embedPagina1 = new EmbedBuilder()
            .setColor('#2F3136')
            .setTitle(`🥷 Ficha Ninja: ${dados.nome || 'Desconhecido'}`)
            .setImage(dados.imagem || null) 
            .addFields(
                { name: '🏘️ Clã', value: `${dados.cla || 'Nenhum'}`, inline: true },
                { name: '📊 Rank Poder', value: `${dados.rank || 'Sem Rank'}`, inline: true },
                { name: '💰 Ryōs', value: `${dados.ryos || 0}`, inline: true },
                { name: '❤️ Vida', value: `\`${dados.vidaAtual || 0} / ${dados.vidaMaxima || 0}\``, inline: true },
                { name: '🌀 Chakra', value: `\`${dados.chakraAtual || 0} / ${dados.chakraMaxima || 0}\``, inline: true },
                { name: '🎂 Idade', value: `${dados.idade || '?'} anos`, inline: true },
                { name: '💪 Força', value: `${dados.forca || 1}`, inline: true },
                { name: '🏃 Agilidade', value: `${dados.agilidade || 1}`, inline: true },
                { name: '🛡️ Defesa', value: `${dados.defesa || 1}`, inline: true }
            )
            .setFooter({ text: 'Página 1/2 • Status de Combate' });

        // ==========================================
        // LÓGICA DINÂMICA DAS MAESTRIAS (PÁGINA 2)
        // ==========================================
        const gerarBarraNivel = (nivel) => {
            const nivelReal = nivel || 0;
            const total = 5;
            let barra = '';
            for (let i = 1; i <= total; i++) {
                barra += i <= nivelReal ? '🟢' : '⚪';
            }
            return barra;
        };

        const camposMaestrias = [];
        const listaMaestriasConfig = config.cargosOrganizados.maestrias; // Gaveta do config.json

        // Mapeamento manual para converter a chave do config para a chave do perfil
        // Ex: "MaestriaemNinjutsu" -> "ninjutsu"
        const mapaChaves = {
            "MaestriaemNinjutsu": "ninjutsu", "MaestriaemGenjutsu": "genjutsu", "MaestriaemTaijutsu": "taijutsu",
            "MaestriaemBunshinjutsu": "bunshinjutsu", "MaestriaemFluxodeChakra": "fluxoDeChakra", "MaestriaemFuuinjutsu": "fuuinjutsu",
            "MaestriaemHiden": "hiden", "MaestriaemJuinjutsu": "juinjutsu", "MaestriaemJujutsu": "jujutsu",
            "MaestriaemKekkaijutsu": "kekkaijutsu", "MaestriaemKenjutsu": "kenjutsu", "MaestriaemKinjutsu": "kinjutsu",
            "MaestriaemKonbijutsu": "konbijutsu", "MaestriaemKyuuinjutsu": "kyuuinjutsu", "MaestriaemNinjutsuEspacoTempo": "ninjutsuEspacoTempo",
            "MaestriaemNinjutsuMedico": "ninjutsuMedico", "MaestriaemNintaijutsu": "nintaijutsu", "MaestriaemSenjutsu": "senjutsu",
            "MaestriaemShurikenjutsu": "shurikenjutsu", "MaestriaemTenseijutsu": "tenseijutsu"
        };

        // Verifica cada maestria configurada
        for (const [chaveLimpa, idCargo] of Object.entries(listaMaestriasConfig)) {
            // Se o usuário tem o cargo no Discord
            if (message.member.roles.cache.has(idCargo)) {
                const chavePerfil = mapaChaves[chaveLimpa];
                const nivel = dados.maestrias?.[chavePerfil] || 0;
                
                // Formata o nome para exibição (ex: Maestria em Ninjutsu)
                const nomeFormatado = chaveLimpa.replace("Maestriaem", "🔹 ");
                
                camposMaestrias.push({
                    name: nomeFormatado,
                    value: gerarBarraNivel(nivel),
                    inline: true
                });
            }
        }

        const embedPagina2 = new EmbedBuilder()
            .setColor('#9B59B6')
            .setTitle(`📜 Habilidades de ${dados.nome || 'Desconhecido'}`)
            .setDescription(`**👁️ Dōjutsu:** ${dados.doujutsu || 'Nenhum'}\n**🧪 Kekkei Genkai:** ${dados.kekkei || 'Nenhuma'}`)
            .setImage('https://i.pinimg.com/736x/7f/46/03/7f46031511ed0555d9bbf549aa8ebc41.jpg')
            .setFooter({ text: 'Página 2/2 • Maestrias e Linhagens' });

        if (camposMaestrias.length > 0) {
            embedPagina2.addFields(camposMaestrias);
        } else {
            embedPagina2.addFields({ name: '⚠️ Nenhuma Maestria', value: 'Você ainda não possui cargos de maestria para exibir níveis aqui.', inline: false });
        }

        // ==========================================
        // CONTROLES E COLETOR
        // ==========================================
        const botoes = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('voltar').setLabel('Status Base').setEmoji('⚔️').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId('proximo').setLabel('Maestrias').setEmoji('📜').setStyle(ButtonStyle.Success)
        );

        const msgStatus = await message.reply({ embeds: [embedPagina1], components: [botoes] });

        const coletor = msgStatus.createMessageComponentCollector({
            filter: (i) => i.user.id === message.author.id,
            time: 120000 
        });

        coletor.on('collect', async (interacao) => {
            if (interacao.customId === 'proximo') {
                await interacao.update({ embeds: [embedPagina2] });
            } else if (interacao.customId === 'voltar') {
                await interacao.update({ embeds: [embedPagina1] });
            }
        });

        coletor.on('end', () => {
            msgStatus.edit({ components: [] }).catch(() => {});
        });
    }
};