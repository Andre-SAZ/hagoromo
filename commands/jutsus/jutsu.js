const fs = require('fs');
const { EmbedBuilder } = require('discord.js');
const config = require('../../config.json');
const banco = require('../../banco.js');
const batalhasAtivas = require('../../gerenciadorBatalhas.js'); // Importa a memória da arena

module.exports = {
    nome: '!jutsu',

    executar(message) {
        const args = message.content.trim().split(/ +/);

        if (args.length < 3) {
            return message.reply('⚠️ Use: `!jutsu <elemento> <nome_curto>`\nExemplo: `!jutsu katon goukakyuu`');
        }

        const elementoDigitado = args[1].toLowerCase();
        const jutsuSorteado = args[2].toLowerCase();

        // Verifica se o elemento digitado existe no nosso config.json
        if (!config.cores[elementoDigitado]) {
            return message.reply('❌ Elemento desconhecido. Escolha entre: katon, suiton, fuuton, doton ou raiton.');
        }

        // --------------------------------------------------
        // PASSO 1: LER O BANCO E VERIFICAR A FICHA
        // --------------------------------------------------
        const perfis = banco.ler();
        const idUsuario = message.author.id;
        const dados = perfis[idUsuario];

        if (!dados) {
            return message.reply('❌ Você precisa criar um perfil primeiro usando `!novo`.');
        }

        const jutsusDoJogador = dados.jutsusAprendidos && dados.jutsusAprendidos[elementoDigitado] 
            ? dados.jutsusAprendidos[elementoDigitado] 
            : [];
        
        if (!jutsusDoJogador.includes(jutsuSorteado)) {
            return message.reply(`❌ Você ainda não aprendeu essa técnica! Treine usando: \`!aprenderjutsu ${elementoDigitado} ${jutsuSorteado}\``);
        }

        // --------------------------------------------------
        // PASSO 2: PUXAR OS DADOS DO SERVIDOR
        // --------------------------------------------------
        const caminhoArquivo = `./jutsus/${elementoDigitado}.json`;

        if (!fs.existsSync(caminhoArquivo)) {
            return message.reply(`❌ O banco de dados de ${elementoDigitado} não foi encontrado.`);
        }

        const dadosElemento = fs.readFileSync(caminhoArquivo, 'utf-8');
        const listaJutsus = JSON.parse(dadosElemento);

        const jutsu = listaJutsus[jutsuSorteado];

        if (!jutsu) {
            return message.reply('❌ Esse jutsu não existe no banco de dados do servidor.');
        }

        // --------------------------------------------------
        // PASSO 3: DESCONTAR O CHAKRA
        // --------------------------------------------------
        const custoChakra = jutsu.custoChakra || 0;
        if (dados.chakraAtual === undefined) dados.chakraAtual = dados.chakraMaxima;

        if (dados.chakraAtual < custoChakra) {
            return message.reply(`❌ **Chakra Insuficiente!** Você tem ${dados.chakraAtual} 🌀 mas precisa de ${custoChakra} 🌀 para usar esta técnica.`);
        }

        // Desconta o chakra e salva
        dados.chakraAtual -= custoChakra;
        perfis[idUsuario] = dados;
        banco.salvar(perfis);

        // --------------------------------------------------
        // PASSO 4: MONTAR O VISUAL
        // --------------------------------------------------
        const corElemento = config.cores[elementoDigitado];
        const emojiElemento = config.emojis[elementoDigitado];
        const rankTexto = config.nomesRanks[jutsu.rank] || `Rank ${jutsu.rank}`;

        const painelJutsu = new EmbedBuilder()
            .setColor(corElemento) 
            .setTitle(`${emojiElemento} ${jutsu.nome}`)
            .setDescription(jutsu.descricao)
            .addFields(
                { name: '📊 Rank', value: rankTexto, inline: true },
                { name: '💥 Dano', value: `${jutsu.dano}`, inline: true },
                { name: '🌀 Custo', value: `${custoChakra}`, inline: true }
            )
            .setImage(jutsu.imagem || null);

        // --------------------------------------------------
        // PASSO 5: DECIDIR SE É ARENA OU RP LIVRE
        // --------------------------------------------------
        if (batalhasAtivas.has(idUsuario)) {
            const batalha = batalhasAtivas.get(idUsuario);

            // Trava: se não for a vez dele
            if (batalha.atacanteAtual !== idUsuario || batalha.fase !== 'ATAQUE') {
                return message.reply('⏳ Calma! Você está em uma batalha, mas agora não é o seu turno de atacar.');
            }

            // Salva o dano na memória invisível e vira o turno para a Defesa
            batalha.danoPendente = jutsu.dano || 0;
            batalha.jutsuPendenteTexto = jutsu.nome;
            batalha.fase = 'DEFESA'; 

            painelJutsu.addFields({
                name: '➡️ Turno de DEFESA',
                value: `<@${batalha.defensorAtual}>, reaja rápido! Faça o seu roleplay e use:\n\`!desviar\`, \`!bloquear\` ou \`!suportar\``
            });

            return message.reply({ content: `<@${batalha.defensorAtual}>`, embeds: [painelJutsu] });

        } else {
            // MODO LIVRE: O jogador não está lutando, apenas fez o RP no chat
            painelJutsu.setFooter({ text: `Lançado livremente por ${message.author.username} (-${custoChakra} Chakra)` });
            return message.reply({ embeds: [painelJutsu] });
        }
    }
};