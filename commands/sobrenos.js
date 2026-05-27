const fs = require('fs');
const { EmbedBuilder } = require('discord.js');
const config = require('../config.json');
const banco = require('../banco.js');

module.exports = {
    nome: '!sobrenos',

    async executar(message) {
        // 1. Contagem de perfis cadastrados no RPG
        const perfis = banco.ler();
        const totalNinjas = Object.keys(perfis).length;

        // 2. Contagem de dados estruturados na configuração interna
        const gavetas = config.cargosOrganizados || {};
        const totalClas = Object.keys(gavetas.clas || {}).length;
        const totalElementos = Object.keys(gavetas.elementos || {}).length;
        const totalKekkei = Object.keys(gavetas.kekkeigenkai || {}).length;
        const totalDoujutsus = Object.keys(gavetas.doujutsus || {}).length;
        const totalEstilos = Object.keys(gavetas.estilosLuta || {}).length;

        // 3. Contagem de dados dinâmicos do próprio servidor do Discord
        const totalCargosServer = message.guild.roles.cache.size;
        const totalMembros = message.guild.memberCount;

        // 4. Varredura dinâmica de Jutsus (soma o conteúdo de todos os arquivos da pasta jutsus)
        let totalJutsus = 0;
        const pastaJutsus = './jutsus';
        if (fs.existsSync(pastaJutsus)) {
            const arquivos = fs.readdirSync(pastaJutsus).filter(file => file.endsWith('.json'));
            for (const arquivo of arquivos) {
                try {
                    const conteudo = JSON.parse(fs.readFileSync(`${pastaJutsus}/${arquivo}`, 'utf-8'));
                    totalJutsus += Object.keys(conteudo).length;
                } catch (e) {
                    // Ignora eventuais arquivos corrompidos ou vazios durante a leitura
                }
            }
        }

        // 5. Quantidade de comandos registrados na memória do Bot
        const totalComandos = message.client.commands ? message.client.commands.size : 8;

        // Nome dinâmico do bot
        const nomeBot = message.client.user.username;

        const embedSobre = new EmbedBuilder()
            .setColor('#F1C40F')
            .setTitle(`⛩️ Sobre o projeto: ${nomeBot}`)
            .setThumbnail(message.client.user.displayAvatarURL())
            .setDescription(
                `Olá! Eu sou o **${nomeBot}**, uma aplicação focada em gerenciamento e automação de sistemas de RPG baseados em texto e comandos de interação direta para comunidades do Discord.\n\n` +
                `### 🛠️ Desenvolvimento & Origem\n` +
                `Fui totalmente programado do zero pelo desenvolvedor **André** (20 anos), estudante do curso de **Sistemas para Internet** na faculdade pública **IF**. \n\n` +
                `Este ecossistema de comandos foi idealizado e construído como um laboratório prático focado em testar, validar e consolidar conhecimentos em arquitetura de software, manipulação de bancos de dados locais estruturados em formato JSON, assincronismo, modularização e tratamento de regras de negócio em JavaScript.`
            )
            .addFields(
                { 
                    name: '🚀 Principais Funcionalidades Implementadas', 
                    value: '• **Criação de Personagem Assistida:** Engine de carrossel iterativo para amostragem dinâmica de clãs de forma limpa.\n' +
                           '• **Gerenciador de Atributos:** Controle automatizado de status físicos, reservas energéticas (Vida e Chakra) e economia interna de Ryōs.\n' +
                           '• **Restrições de Contexto Shinobi:** Filtros inteligentes que barram ações inconsistentes (como a incapacidade do Clã Lee de conjurar jutsus elementais).\n' +
                           '• **Estruturação de Cargos Automatizada:** Geração em lote de tags organizacionais e divisores visuais estilizados para perfis do Discord.',
                    inline: false 
                },
                {
                    name: '📊 Dados Métricos do Ecossistema (Atualizados em Tempo Real)',
                    value: `🤖 **Comandos Registrados:** \`${totalComandos}\`\n` +
                           `👥 **Usuários com Ficha Ativa:** \`${totalNinjas}\`\n` +
                           `⛩️ **Linhagens e Clãs Instalados:** \`${totalClas}\`\n` +
                           `📜 **Técnicas e Jutsus Mapeados:** \`${totalJutsus}\`\n` +
                           `✨ **Elementos Básicos:** \`${totalElementos}\`\n` +
                           `🧪 **Kekkei Genkais:** \`${totalKekkei}\`\n` +
                           `👁️ **Dōjutsus Incorporados:** \`${totalDoujutsus}\`\n` +
                           `🥋 **Estilos de Luta Ativos:** \`${totalEstilos}\`\n` +
                           `🏷️ **Total de Cargos no Servidor:** \`${totalCargosServer}\`\n` +
                           `👥 **População Total do Servidor:** \`${totalMembros}\``,
                    inline: false
                }
            )
            .setFooter({ text: `${nomeBot} RPG • Feito em Javascript usando Discord.js` })
            .setTimestamp();

        await message.reply({ embeds: [embedSobre] });
    }
};