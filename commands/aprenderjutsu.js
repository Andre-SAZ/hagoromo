const fs = require('fs');
const { EmbedBuilder } = require('discord.js');
const config = require('../config.json');
const banco = require('../banco.js');

module.exports = {
    nome: '!aprenderjutsu',

    executar(message) {
        const args = message.content.trim().split(/ +/);
        const perfis = banco.ler();
        const idUsuario = message.author.id;
        const dados = perfis[idUsuario];

        if (!dados) {
            return message.reply('❌ Crie seu perfil primeiro usando o comando `!novo`.');
        }

        // ==========================================
        // MODO LISTA: APENAS !aprenderjutsu
        // ==========================================
        if (args.length === 1) {
            const rankUsuario = dados.rank || 'Rank E';
            const elementosUsuario = [];

            // Verifica quais cargos de elemento o jogador tem
            for (const [chaveLimpa, idCargo] of Object.entries(config.cargosOrganizados.elementos)) {
                if (message.member.roles.cache.has(idCargo)) {
                    let nomeElemento = '';
                    if (chaveLimpa.toLowerCase().includes('katon')) nomeElemento = 'katon';
                    else if (chaveLimpa.toLowerCase().includes('suiton')) nomeElemento = 'suiton';
                    else if (chaveLimpa.toLowerCase().includes('fuuton')) nomeElemento = 'fuuton';
                    else if (chaveLimpa.toLowerCase().includes('doton')) nomeElemento = 'doton';
                    else if (chaveLimpa.toLowerCase().includes('raiton')) nomeElemento = 'raiton';

                    if (nomeElemento) elementosUsuario.push(nomeElemento);
                }
            }

            if (elementosUsuario.length === 0) {
                return message.reply('❌ Você não tem nenhum elemento para aprender jutsus ainda.');
            }

            const painelLista = new EmbedBuilder()
                .setColor('#2F3136')
                .setTitle(`📜 Jutsus Disponíveis - Nível: ${rankUsuario}`)
                .setDescription('Use o comando `!aprenderjutsu <elemento> <nome_curto>` para treinar a técnica que escolher.')
                .setFooter({ text: 'Apenas jutsus do seu rank e elementos aparecem aqui.' });

            let encontrouJutsu = false;

            for (const elemento of elementosUsuario) {
                const caminhoArquivo = `./jutsus/${elemento}.json`;
                if (!fs.existsSync(caminhoArquivo)) continue;

                const dbElemento = JSON.parse(fs.readFileSync(caminhoArquivo, 'utf-8'));
                let listaTexto = [];

                for (const [nomeCurto, jutsu] of Object.entries(dbElemento)) {
                    // Limpa a palavra "Rank" para comparar só a letra (ex: "E")
                    const rankJutsuLimpo = jutsu.rank.replace('Rank', '').trim();
                    const rankUsuarioLimpo = rankUsuario.replace('Rank', '').trim();

                    if (rankJutsuLimpo === rankUsuarioLimpo) {
                        // Confere se não aprendeu ainda
                        const jaAprendeu = dados.jutsusAprendidos && 
                                           dados.jutsusAprendidos[elemento] && 
                                           dados.jutsusAprendidos[elemento].includes(nomeCurto);
                        
                        if (!jaAprendeu) {
                            listaTexto.push(`**${jutsu.nome}** (\`${nomeCurto}\`) | Custo: 🌀 ${jutsu.custoChakra}`);
                        }
                    }
                }

                if (listaTexto.length > 0) {
                    const nomeHeader = config.nomesExibicao && config.nomesExibicao[elemento] 
                        ? config.nomesExibicao[elemento] 
                        : elemento.toUpperCase();
                        
                    painelLista.addFields({ name: nomeHeader, value: listaTexto.join('\n'), inline: false });
                    encontrouJutsu = true;
                }
            }

            if (!encontrouJutsu) {
                painelLista.addFields({ 
                    name: 'Tudo dominado!', 
                    value: 'Você já aprendeu todos os jutsus do seu Rank para os seus elementos. Tente subir de Rank para liberar mais!' 
                });
            }

            return message.reply({ embeds: [painelLista] });
        }

        // ==========================================
        // MODO APRENDER: !aprenderjutsu <elemento> <jutsu>
        // ==========================================
        if (args.length < 3) {
            return message.reply('⚠️ Use: `!aprenderjutsu <elemento> <nome_curto>` ou digite apenas `!aprenderjutsu` para ver a lista.');
        }

        const elementoDigitado = args[1].toLowerCase();
        const jutsuDigitado = args[2].toLowerCase();

        // Pega o ID na gaveta correta de elementos do config
        const chaveElemento = Object.keys(config.cargosOrganizados.elementos).find(k => k.toLowerCase().includes(elementoDigitado));
        
        if (!chaveElemento) {
            return message.reply(`❌ O elemento **${elementoDigitado}** não existe nas configurações.`);
        }
        
        const idCargoNecessario = config.cargosOrganizados.elementos[chaveElemento];

        const temCargo = message.member.roles.cache.has(idCargoNecessario);

        if (!temCargo) {
            return message.reply(`❌ Você não tem a permissão ninja necessária! Precisa do cargo de **${elementoDigitado.toUpperCase()}**.`);
        }

        const caminhoArquivo = `./jutsus/${elementoDigitado}.json`;

        if (!fs.existsSync(caminhoArquivo)) {
            return message.reply(`❌ O arquivo de banco de dados para **${elementoDigitado}** não foi encontrado.`);
        }

        const dadosElemento = fs.readFileSync(caminhoArquivo, 'utf-8');
        const listaJutsus = JSON.parse(dadosElemento);

        if (!listaJutsus[jutsuDigitado]) {
            return message.reply(`❌ O jutsu **${jutsuDigitado}** não existe na lista de ${elementoDigitado}.`);
        }

        // Trava para impedir aprendizado de jutsus de Rank maior
        const rankJutsu = listaJutsus[jutsuDigitado].rank.replace('Rank', '').trim();
        const rankUser = (dados.rank || 'Rank E').replace('Rank', '').trim();
        
        if (rankJutsu !== rankUser) {
            return message.reply(`❌ Esse jutsu é Rank ${rankJutsu}, mas você é Rank ${rankUser}. Você só pode aprender jutsus do seu nível!`);
        }

        if (!dados.jutsusAprendidos[elementoDigitado]) {
            dados.jutsusAprendidos[elementoDigitado] = [];
        }

        if (dados.jutsusAprendidos[elementoDigitado].includes(jutsuDigitado)) {
            return message.reply('⚠️ Você já domina essa técnica!');
        }

        dados.jutsusAprendidos[elementoDigitado].push(jutsuDigitado);
        banco.salvar(perfis);

        const nomeCompleto = listaJutsus[jutsuDigitado].nome;
        message.reply(`📜 Sucesso! Você treinou duro e aprendeu a técnica: **${nomeCompleto}**!`);
    }
};