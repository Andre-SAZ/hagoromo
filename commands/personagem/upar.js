const { EmbedBuilder } = require('discord.js');
const banco = require('../../banco.js');
const config = require('../../config.json'); // Puxa o config para fazer a tradução visual

module.exports = {
    nome: '!upar',

    async executar(message) {
        // Se quiser que apenas administradores usem isto no futuro, descomente a linha abaixo:
        // if (!message.member.permissions.has('Administrator')) return message.reply('❌ Comando restrito para testes da Staff.');

        const perfis = banco.ler();
        const idUsuario = message.author.id;
        const dados = perfis[idUsuario];

        if (!dados) {
            return message.reply('❌ Precisas de ter uma ficha para subir de Rank. Usa `!novo`.');
        }

        // Pega o rank atual numérico (padrão 1 se estiver vazio)
        const rankAtualNum = dados.rank || 1;

        // Trava de segurança: Se o rank já for 6 (Rank S), não sobe mais
        if (rankAtualNum >= 6) {
            return message.reply('🏆 Já atingiste o **Rank S**! Não há mais nada acima disto para testar.');
        }

        // MATEMÁTICA PURA: Descobre o novo rank apenas somando 1
        const novoRankNum = rankAtualNum + 1;

        // Traduz os números para texto para exibir no Discord
        const textoRankAnterior = config.nomesRanks[rankAtualNum] || `Rank ${rankAtualNum}`;
        const textoNovoRank = config.nomesRanks[novoRankNum] || `Rank ${novoRankNum}`;

        // Atualiza a ficha e guarda no banco de dados
        dados.rank = novoRankNum;
        perfis[idUsuario] = dados;
        banco.salvar(perfis);

        // Prepara a resposta visual elegante
        const embedUpar = new EmbedBuilder()
            .setColor('#2ECC71') // Verde Sucesso
            .setTitle('🔼 Promoção Ninja (Modo Teste)')
            .setDescription(`**${dados.nome}** treinou arduamente (ou usou um comando de teste) e foi promovido com sucesso!`)
            .addFields(
                { name: 'Rank Anterior', value: `~~${textoRankAnterior}~~`, inline: true },
                { name: 'Novo Rank', value: `**${textoNovoRank}**`, inline: true }
            )
            .setFooter({ text: 'Usa !aprenderjutsu agora para veres as tuas novas técnicas!' });

        await message.reply({ embeds: [embedUpar] });
    }
};