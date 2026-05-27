const fs = require('fs');
const { PermissionsBitField, EmbedBuilder } = require('discord.js');
const banco = require('../../banco.js');

module.exports = {
    nome: '!reset',

    async executar(message) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
            return message.reply('❌ Apenas membros da Staff com permissão de Gerenciar Cargos podem usar este comando.');
        }

        const alvo = message.mentions.members.first();
        if (!alvo) {
            return message.reply('⚠️ Você precisa marcar o jogador que deseja resetar. Ex: `!reset @fulano`');
        }

        const perfis = banco.ler();
        const idUsuario = alvo.id;
        const dados = perfis[idUsuario];

        if (!dados) {
            return message.reply(`❌ O jogador **${alvo.user.username}** não possui um perfil ativo para ser resetado.`);
        }

        await message.reply(`🔄 Iniciando o reset da conta de **${alvo.user.username}**... Enviando DM e removendo cargos.`);

        // ==========================================
        // PREPARAÇÃO DE DADOS PARA A DM (BACKUP)
        // ==========================================
        // 1. Filtrando Maestrias
        let textoMaestrias = [];
        const mapaNomesMaestrias = {
            ninjutsu: 'Ninjutsu', genjutsu: 'Genjutsu', taijutsu: 'Taijutsu', bunshinjutsu: 'Bunshinjutsu', 
            fluxoDeChakra: 'Fluxo de Chakra', fuuinjutsu: 'Fuuinjutsu', hiden: 'Hiden', juinjutsu: 'Juinjutsu', 
            jujutsu: 'Jujutsu', kekkaijutsu: 'Kekkaijutsu', kenjutsu: 'Kenjutsu', kinjutsu: 'Kinjutsu', 
            konbijutsu: 'Konbijutsu', kyuuinjutsu: 'Kyuuinjutsu', ninjutsuEspacoTempo: 'Ninjutsu Espaço-Tempo', 
            ninjutsuMedico: 'Ninjutsu Médico', nintaijutsu: 'Nintaijutsu', senjutsu: 'Senjutsu', 
            shurikenjutsu: 'Shurikenjutsu', tenseijutsu: 'Tenseijutsu'
        };

        if (dados.maestrias) {
            for (const [chave, nivel] of Object.entries(dados.maestrias)) {
                if (nivel > 0) {
                    const nomeFormatado = mapaNomesMaestrias[chave] || chave;
                    textoMaestrias.push(`• ${nomeFormatado}: Nível ${nivel}`);
                }
            }
        }
        const stringMaestrias = textoMaestrias.length > 0 ? textoMaestrias.join('\n') : 'Nenhuma maestria upada.';

        // 2. Filtrando Jutsus Aprendidos
        let textoJutsus = [];
        if (dados.jutsusAprendidos) {
            for (const [categoria, lista] of Object.entries(dados.jutsusAprendidos)) {
                if (lista && lista.length > 0) {
                    // Deixa a primeira letra maiúscula (ex: katon -> Katon)
                    const catFormatada = categoria.charAt(0).toUpperCase() + categoria.slice(1);
                    textoJutsus.push(`**${catFormatada}:** ${lista.join(', ')}`);
                }
            }
        }
        const stringJutsus = textoJutsus.length > 0 ? textoJutsus.join('\n') : 'Nenhum jutsu aprendido.';

        // ==========================================
        // MONTAGEM DA DM
        // ==========================================
        const dataReset = new Date().toLocaleString('pt-BR');

        const embedDM = new EmbedBuilder()
            .setColor('#E74C3C')
            .setTitle('⚠️ Seu Perfil Shinobi foi Resetado')
            .setDescription(`Olá! Seu perfil no servidor **${message.guild.name}** foi resetado por um administrador. Abaixo estão os dados do seu personagem guardados como backup de segurança:`)
            .addFields(
                { name: '🥷 Nome', value: `${dados.nome}`, inline: true },
                { name: '⛩️ Clã', value: `${dados.cla}`, inline: true },
                { name: '📊 Rank', value: `${dados.rank || 'Rank E'}`, inline: true },
                { name: '💰 Ryōs', value: `${dados.ryos || 0}`, inline: true },
                { name: '❤️ Vida', value: `${dados.vidaMaxima}`, inline: true },
                { name: '🌀 Chakra', value: `${dados.chakraMaxima}`, inline: true },
                { name: '📜 Maestrias', value: stringMaestrias, inline: false },
                { name: '⚔️ Jutsus Aprendidos', value: stringJutsus, inline: false },
                { name: '📅 Data do Reset', value: `${dataReset}`, inline: false }
            )
            .setFooter({ text: 'Se você acha que isso foi um engano ou precisa de estorno, apresente este comprovante para a Staff.' });

        try {
            await alvo.send({ embeds: [embedDM] });
        } catch (erro) {
            message.channel.send(`⚠️ Não foi possível enviar a mensagem privada para **${alvo.user.username}** (ele pode estar com as DMs fechadas), mas o reset continuará.`);
        }

        // ==========================================
        // LIMPEZA DE CARGOS DO ALVO
        // ==========================================
        let cargosParaRemover = [];
        const caminhoConfig = './config.json';
        
        if (fs.existsSync(caminhoConfig)) {
            const config = JSON.parse(fs.readFileSync(caminhoConfig, 'utf-8'));
            const gavetas = config.cargosOrganizados || {};

            for (const categoria in gavetas) {
                for (const chave in gavetas[categoria]) {
                    const idCargo = gavetas[categoria][chave];
                    if (alvo.roles.cache.has(idCargo)) {
                        cargosParaRemover.push(idCargo);
                    }
                }
            }
        }

        if (dados.cla) {
            const cargoClaPorNome = message.guild.roles.cache.find(r => r.name.toLowerCase() === dados.cla.toLowerCase());
            if (cargoClaPorNome && !cargosParaRemover.includes(cargoClaPorNome.id)) {
                cargosParaRemover.push(cargoClaPorNome.id);
            }
        }

        alvo.roles.cache.forEach(cargo => {
            const nome = cargo.name;
            if (nome.includes('Clã') || nome.includes('Família') || nome.includes('Linhagem')) {
                if (!cargosParaRemover.includes(cargo.id)) {
                    cargosParaRemover.push(cargo.id);
                }
            }
        });

        if (cargosParaRemover.length > 0) {
            for (const idCargo of cargosParaRemover) {
                await alvo.roles.remove(idCargo).catch(() => {});
            }
        }

        // ==========================================
        // APAGA DO BANCO DE DADOS
        // ==========================================
        delete perfis[idUsuario];
        banco.salvar(perfis);

        message.channel.send(`✅ **Operação Concluída!** A ficha de <@${alvo.id}> foi eliminada do banco de dados e os cargos foram limpos.`);
    }
};