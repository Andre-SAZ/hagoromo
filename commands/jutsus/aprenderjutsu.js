const fs = require('fs');
const { EmbedBuilder } = require('discord.js');
const config = require('../../config.json');
const banco = require('../../banco.js');

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
        // TRAVA EXCLUSIVA: CLÃ LEE
        // ==========================================
        if (dados.cla === 'Clã Lee') {
            if (args.length === 1 || args[1].toLowerCase() !== 'taijutsu') {
                return message.reply('🥋 **O Poder da Juventude!** Ninjas do Clã Lee não conseguem moldar chakra para Ninjutsu ou Genjutsu. Você é proibido de aprender técnicas elementais e deve focar inteiramente no **Taijutsu**.');
            }
        }

        // ==========================================
        // MODO LISTA: APENAS !aprenderjutsu
        // ==========================================
        if (args.length === 1) {
            const rankUsuario = dados.rank || 'Rank E';
            const categoriasUsuario = [];

            // Verifica cargos de elemento
           // O bot agora lê os elementos diretamente da ficha do jogador no banco de dados!
            if (dados.elementos && Array.isArray(dados.elementos)) {
                for (const elem of dados.elementos) {
                    categoriasUsuario.push(elem.toLowerCase());
                }
            }
const fs = require('fs');
const { EmbedBuilder } = require('discord.js');
const config = require('../../config.json');
const banco = require('../../banco.js');

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
        // TRAVA EXCLUSIVA: CLÃ LEE
        // ==========================================
        if (dados.cla === 'Clã Lee') {
            if (args.length === 1 || args[1].toLowerCase() !== 'taijutsu') {
                return message.reply('🥋 **O Poder da Juventude!** Ninjas do Clã Lee não conseguem moldar chakra para Ninjutsu ou Genjutsu. Você é proibido de aprender técnicas elementais e deve focar inteiramente no **Taijutsu**.');
            }
        }

        // ==========================================
        // LÓGICA DE RANKS (NÚMEROS PARA TEXTO)
        // ==========================================
        const rankUsuario = dados.rank || 1; // 1 é o equivalente a Rank E
        const rankTextoUsuario = config.nomesRanks[rankUsuario] || 'Rank Desconhecido';

        // ==========================================
        // MODO LISTA: APENAS !aprenderjutsu
        // ==========================================
        if (args.length === 1) {
            const categoriasUsuario = [];

            // O bot agora lê os elementos diretamente da ficha do jogador no banco de dados
            if (dados.elementos && Array.isArray(dados.elementos)) {
                for (const elem of dados.elementos) {
                    categoriasUsuario.push(elem.toLowerCase());
                }
            }

            if (categoriasUsuario.length === 0) {
                return message.reply('❌ Você não tem nenhum elemento ou permissão para aprender jutsus ainda.');
            }

            const painelLista = new EmbedBuilder()
                .setColor('#2F3136')
                .setTitle(`📜 Jutsus Disponíveis - Nível: ${rankTextoUsuario}`)
                .setDescription('Use o comando `!aprenderjutsu <elemento/categoria> <nome_curto>` para treinar a técnica que escolher.')
                .setFooter({ text: 'Apenas jutsus do seu rank ou inferior aparecem aqui.' });

            let encontrouJutsu = false;

            for (const categoria of categoriasUsuario) {
                const caminhoArquivo = `./jutsus/${categoria}.json`;
                if (!fs.existsSync(caminhoArquivo)) continue;

                const dbCategoria = JSON.parse(fs.readFileSync(caminhoArquivo, 'utf-8'));
                let listaTexto = [];

                for (const [nomeCurto, jutsu] of Object.entries(dbCategoria)) {
                    // MAGIA AQUI: O bot só verifica se o número do jutsu é menor ou igual ao seu
                    if (jutsu.rank <= rankUsuario) {
                        const jaAprendeu = dados.jutsusAprendidos && 
                                           dados.jutsusAprendidos[categoria] && 
                                           dados.jutsusAprendidos[categoria].includes(nomeCurto);
                        
                        if (!jaAprendeu) {
                            const rankTextoJutsu = config.nomesRanks[jutsu.rank] || `Rank ${jutsu.rank}`;
                            listaTexto.push(`**${jutsu.nome}** (\`${nomeCurto}\`) | Rank: ${rankTextoJutsu} | Custo: 🌀 ${jutsu.custoChakra}`);
                        }
                    }
                }

                if (listaTexto.length > 0) {
                    const nomeHeader = config.nomesExibicao && config.nomesExibicao[categoria] 
                        ? config.nomesExibicao[categoria] 
                        : categoria.toUpperCase();
                        
                    painelLista.addFields({ name: nomeHeader, value: listaTexto.join('\n'), inline: false });
                    encontrouJutsu = true;
                }
            }

            if (!encontrouJutsu) {
                painelLista.addFields({ 
                    name: 'Tudo dominado!', 
                    value: 'Você já aprendeu todos os jutsus disponíveis para o seu nível! Tente subir de Rank para liberar mais.' 
                });
            }

            return message.reply({ embeds: [painelLista] });
        }

        // ==========================================
        // MODO APRENDER: !aprenderjutsu <categoria> <jutsu>
        // ==========================================
        if (args.length < 3) {
            return message.reply('⚠️ Use: `!aprenderjutsu <elemento/categoria> <nome_curto>` ou digite apenas `!aprenderjutsu` para ver a lista.');
        }

        const categoriaDigitada = args[1].toLowerCase();
        const jutsuDigitado = args[2].toLowerCase();

        // Verifica se a pessoa tem o elemento lendo a ficha, e não os cargos do Discord!
        if (!(dados.cla === 'Clã Lee' && categoriaDigitada === 'taijutsu')) {
            const chaveElemento = Object.keys(config.cargosOrganizados.elementos).find(k => k.toLowerCase().includes(categoriaDigitada));
            
            if (!chaveElemento && categoriaDigitada !== 'taijutsu') {
                return message.reply(`❌ A categoria **${categoriaDigitada}** não existe nas configurações.`);
            }
            
            if (chaveElemento) {
                const temElemento = dados.elementos && dados.elementos.includes(categoriaDigitada);

                if (!temElemento) {
                    return message.reply(`❌ Você não tem a afinidade elemental necessária! Precisa ser usuário de **${categoriaDigitada.toUpperCase()}**.`);
                }
            }
        }

        const caminhoArquivo = `./jutsus/${categoriaDigitada}.json`;

        if (!fs.existsSync(caminhoArquivo)) {
            return message.reply(`❌ O arquivo de banco de dados para **${categoriaDigitada}** não foi encontrado. Certifique-se de ter um arquivo json para ele.`);
        }

        const dadosCategoria = fs.readFileSync(caminhoArquivo, 'utf-8');
        const listaJutsus = JSON.parse(dadosCategoria);

        if (!listaJutsus[jutsuDigitado]) {
            return message.reply(`❌ O jutsu **${jutsuDigitado}** não existe na lista de ${categoriaDigitada}.`);
        }

        const rankJutsu = listaJutsus[jutsuDigitado].rank;
        
        // Compara matematicamente e traduz caso o nível seja insuficiente
        if (rankJutsu > rankUsuario) {
            const rankTextoJutsu = config.nomesRanks[rankJutsu] || `Rank ${rankJutsu}`;
            return message.reply(`❌ Esse jutsu é **${rankTextoJutsu}**, mas você é apenas **${rankTextoUsuario}**. Você ainda não tem nível para aprender essa técnica!`);
        }

        if (!dados.jutsusAprendidos[categoriaDigitada]) {
            dados.jutsusAprendidos[categoriaDigitada] = [];
        }

        if (dados.jutsusAprendidos[categoriaDigitada].includes(jutsuDigitado)) {
            return message.reply('⚠️ Você já domina essa técnica!');
        }

        dados.jutsusAprendidos[categoriaDigitada].push(jutsuDigitado);
        banco.salvar(perfis);

        const nomeCompleto = listaJutsus[jutsuDigitado].nome;
        message.reply(`📜 Sucesso! Você treinou duro e aprendeu a técnica: **${nomeCompleto}**!`);
    }
};
            if (categoriasUsuario.length === 0) {
                return message.reply('❌ Você não tem nenhum elemento ou permissão para aprender jutsus ainda.');
            }

            const painelLista = new EmbedBuilder()
                .setColor('#2F3136')
                .setTitle(`📜 Jutsus Disponíveis - Nível: ${rankUsuario}`)
                .setDescription('Use o comando `!aprenderjutsu <elemento/categoria> <nome_curto>` para treinar a técnica que escolher.')
                .setFooter({ text: 'Apenas jutsus do seu rank e elementos aparecem aqui.' });

            let encontrouJutsu = false;

            for (const categoria of categoriasUsuario) {
                const caminhoArquivo = `./jutsus/${categoria}.json`;
                if (!fs.existsSync(caminhoArquivo)) continue;

                const dbCategoria = JSON.parse(fs.readFileSync(caminhoArquivo, 'utf-8'));
                let listaTexto = [];

                for (const [nomeCurto, jutsu] of Object.entries(dbCategoria)) {
                    const rankJutsuLimpo = jutsu.rank.replace('Rank', '').trim();
                    const rankUsuarioLimpo = rankUsuario.replace('Rank', '').trim();

                    if (rankJutsuLimpo === rankUsuarioLimpo) {
                        const jaAprendeu = dados.jutsusAprendidos && 
                                           dados.jutsusAprendidos[categoria] && 
                                           dados.jutsusAprendidos[categoria].includes(nomeCurto);
                        
                        if (!jaAprendeu) {
                            listaTexto.push(`**${jutsu.nome}** (\`${nomeCurto}\`) | Custo: 🌀 ${jutsu.custoChakra}`);
                        }
                    }
                }

                if (listaTexto.length > 0) {
                    const nomeHeader = config.nomesExibicao && config.nomesExibicao[categoria] 
                        ? config.nomesExibicao[categoria] 
                        : categoria.toUpperCase();
                        
                    painelLista.addFields({ name: nomeHeader, value: listaTexto.join('\n'), inline: false });
                    encontrouJutsu = true;
                }
            }

            if (!encontrouJutsu) {
                painelLista.addFields({ 
                    name: 'Tudo dominado!', 
                    value: 'Você já aprendeu todos os jutsus do seu Rank para as suas categorias. Tente subir de Rank para liberar mais!' 
                });
            }

            return message.reply({ embeds: [painelLista] });
        }

        // ==========================================
        // MODO APRENDER: !aprenderjutsu <categoria> <jutsu>
        // ==========================================
        if (args.length < 3) {
            return message.reply('⚠️ Use: `!aprenderjutsu <elemento/categoria> <nome_curto>` ou digite apenas `!aprenderjutsu` para ver a lista.');
        }

        const categoriaDigitada = args[1].toLowerCase();
        const jutsuDigitado = args[2].toLowerCase();

        // Se não for Clã Lee aprendendo Taijutsu, verifica o cargo elemental
        if (!(dados.cla === 'Clã Lee' && categoriaDigitada === 'taijutsu')) {
            const chaveElemento = Object.keys(config.cargosOrganizados.elementos).find(k => k.toLowerCase().includes(categoriaDigitada));
            
            if (!chaveElemento && categoriaDigitada !== 'taijutsu') {
                return message.reply(`❌ A categoria **${categoriaDigitada}** não existe nas configurações.`);
            }
            
            if (chaveElemento) {
                const idCargoNecessario = config.cargosOrganizados.elementos[chaveElemento];
                const temCargo = message.member.roles.cache.has(idCargoNecessario);

                if (!temCargo) {
                    return message.reply(`❌ Você não tem a permissão ninja necessária! Precisa do cargo de **${categoriaDigitada.toUpperCase()}**.`);
                }
            }
        }

        const caminhoArquivo = `./jutsus/${categoriaDigitada}.json`;

        if (!fs.existsSync(caminhoArquivo)) {
            return message.reply(`❌ O arquivo de banco de dados para **${categoriaDigitada}** não foi encontrado. Certifique-se de ter um arquivo json para ele.`);
        }

        const dadosCategoria = fs.readFileSync(caminhoArquivo, 'utf-8');
        const listaJutsus = JSON.parse(dadosCategoria);

        if (!listaJutsus[jutsuDigitado]) {
            return message.reply(`❌ O jutsu **${jutsuDigitado}** não existe na lista de ${categoriaDigitada}.`);
        }

        const rankJutsu = listaJutsus[jutsuDigitado].rank.replace('Rank', '').trim();
        const rankUser = (dados.rank || 'Rank E').replace('Rank', '').trim();
        
        if (rankJutsu !== rankUser) {
            return message.reply(`❌ Esse jutsu é Rank ${rankJutsu}, mas você é Rank ${rankUser}. Você só pode aprender jutsus do seu nível!`);
        }

        if (!dados.jutsusAprendidos[categoriaDigitada]) {
            dados.jutsusAprendidos[categoriaDigitada] = [];
        }

        if (dados.jutsusAprendidos[categoriaDigitada].includes(jutsuDigitado)) {
            return message.reply('⚠️ Você já domina essa técnica!');
        }

        dados.jutsusAprendidos[categoriaDigitada].push(jutsuDigitado);
        banco.salvar(perfis);

        const nomeCompleto = listaJutsus[jutsuDigitado].nome;
        message.reply(`📜 Sucesso! Você treinou duro e aprendeu a técnica: **${nomeCompleto}**!`);
    }
};