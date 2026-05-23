const fs = require('fs');

module.exports = {
    nome: '!aprenderjutsu',

    executar(message) {
        const args = message.content.trim().split(/ +/);

        if (args.length < 3) {
            return message.reply('⚠️ Use: `!aprenderjutsu <elemento> <nome_curto>`\nExemplo: `!aprenderjutsu katon goukakyuu`');
        }

        const elementoDigitado = args[1].toLowerCase();
        const jutsuDigitado = args[2].toLowerCase();

        // ==========================================
        // DICIONÁRIO DE IDS PARA VALIDAÇÃO
        // ==========================================
        const idsCargosElementos = {
            katon: '1507646623247896687',
            suiton: '1507646666596024451',
            fuuton: '1507646727380013056',
            doton: '1507646759210582016',
            raiton: '1507646809810538637'
        };

        const idCargoNecessario = idsCargosElementos[elementoDigitado];

        // Se a pessoa digitar um elemento que não mapeamos acima (ex: Hyouton)
        if (!idCargoNecessario) {
            return message.reply(`❌ O elemento **${elementoDigitado}** não possui um cargo válido configurado no bot.`);
        }

        // Verifica diretamente se a lista de cargos da pessoa possui o ID necessário
        const temCargo = message.member.roles.cache.has(idCargoNecessario);

        if (!temCargo) {
            return message.reply(`❌ Você não tem a permissão ninja necessária! É preciso ter o cargo de **${elementoDigitado.toUpperCase()}** no servidor para aprender esta técnica.`);
        }

        // ==========================================
        // VERIFICAÇÃO DO BANCO DE DADOS DO JUTSU
        // ==========================================
        const caminhoArquivo = `./jutsus/${elementoDigitado}.json`;

        if (!fs.existsSync(caminhoArquivo)) {
            return message.reply(`❌ O arquivo de banco de dados para **${elementoDigitado}** não foi encontrado.`);
        }

        const dadosElemento = fs.readFileSync(caminhoArquivo, 'utf-8');
        const listaJutsus = JSON.parse(dadosElemento);

        if (!listaJutsus[jutsuDigitado]) {
            return message.reply(`❌ O jutsu **${jutsuDigitado}** não existe na lista de ${elementoDigitado}. Verifique o nome curto.`);
        }

        // ==========================================
        // GRAVAÇÃO NA FICHA DO JOGADOR
        // ==========================================
        const dadosArquivo = fs.readFileSync('./perfis.json', 'utf-8');
        const perfis = JSON.parse(dadosArquivo);
        const idUsuario = message.author.id;

        if (!perfis[idUsuario]) {
            return message.reply('Crie seu perfil primeiro usando o comando `!novo`.');
        }

        if (!perfis[idUsuario].jutsusAprendidos[elementoDigitado]) {
            perfis[idUsuario].jutsusAprendidos[elementoDigitado] = [];
        }

        if (perfis[idUsuario].jutsusAprendidos[elementoDigitado].includes(jutsuDigitado)) {
            return message.reply('⚠️ Você já domina essa técnica! Digite `!jutsus` para conferir.');
        }

        perfis[idUsuario].jutsusAprendidos[elementoDigitado].push(jutsuDigitado);

        fs.writeFileSync('./perfis.json', JSON.stringify(perfis, null, 2));

        const nomeCompleto = listaJutsus[jutsuDigitado].nome;

        message.reply(`📜 Sucesso! Você treinou duro e aprendeu a técnica: **${nomeCompleto}**!`);
    }
};