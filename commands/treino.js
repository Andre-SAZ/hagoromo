const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const fs = require('fs');
const banco = require('../banco.js');
const config = require('../config.json');

module.exports = {
    nome: '!treino',

    async executar(message) {
        const args = message.content.trim().split(/ +/);
        const perfis = banco.ler();
        const idUsuario = message.author.id;
        const dados = perfis[idUsuario];

        if (!dados) {
            return message.reply('❌ Você ainda não tem um perfil. Crie um usando `!novo`.');
        }

        const idCanalAvaliacao = '1508326739980451892'; 
        const idChatComandosDedicado = config.idChatComandos || '000000000000000000'; 
        const canalOriginal = message.channel;

        const caminhoTreinos = './treinos.json';
        if (!fs.existsSync(caminhoTreinos)) {
            return message.reply('❌ O arquivo `treinos.json` não foi encontrado no sistema.');
        }

        const dbTreinos = JSON.parse(fs.readFileSync(caminhoTreinos, 'utf-8'));

        // ==========================================
        // 1. SISTEMA DE LIMITES E COOLDOWN DIÁRIO
        // ==========================================
        const LIMITE_TREINOS_DIA = 3;
        const tempo24h = 24 * 60 * 60 * 1000;
        const agora = Date.now();

        if (!dados.historicoTreinos) dados.historicoTreinos = [];
        
        // Remove treinos mais velhos que 24 horas da contagem
        dados.historicoTreinos = dados.historicoTreinos.filter(tempo => agora - tempo < tempo24h);

        // Se o jogador passar o limite
        if (dados.historicoTreinos.length >= LIMITE_TREINOS_DIA && args.length > 1) {
            const tempoLiberacao = dados.historicoTreinos[0] + tempo24h;
            const horasFaltando = ((tempoLiberacao - agora) / (1000 * 60 * 60)).toFixed(1);
            return message.reply(`❌ O seu corpo atingiu a exaustão. Você já treinou ${LIMITE_TREINOS_DIA} vezes hoje.\n⏳ **Descanso obrigatório:** Volte em ${horasFaltando} horas.`);
        }

        // ==========================================
        // 2. EXIBIÇÃO DO MENU
        // ==========================================
        if (args.length === 1) {
            const categoriasOrganizadas = {};

            for (const [chave, info] of Object.entries(dbTreinos)) {
                const cat = info.categoria || 'Outros Treinos';
                if (!categoriasOrganizadas[cat]) {
                    categoriasOrganizadas[cat] = [];
                }
                const textoTreino = chave === 'jutsu' 
                    ? `**${info.nome}** (\`!treino jutsu <nome>\`)\n📝 **Função:** ${info.funcao}\n📏 **Caracteres:** ${info.caracteres} | ⏳ **Tempo RP:** ${info.tempoRP}h`
                    : `**${info.nome}** (\`${chave}\`)\n📝 **Função:** ${info.funcao}\n🏆 **Recompensa:** ${info.recompensaDescricao}\n📏 **Caracteres:** ${info.caracteres} | ⏳ **Tempo RP:** ${info.tempoRP}h`;
                
                categoriasOrganizadas[cat].push(textoTreino);
            }

            const painelTreinos = new EmbedBuilder()
                .setColor('#E67E22')
                .setTitle('📜 Lista de Treinamentos Disponíveis')
                .setDescription(`Você tem **${LIMITE_TREINOS_DIA - dados.historicoTreinos.length} treinos** disponíveis hoje.\nExemplo: \`!treino forca\` ou \`!treino jutsu chidori\``);

            for (const [categoria, listaTreinos] of Object.entries(categoriasOrganizadas)) {
                painelTreinos.addFields({ name: `▬▬▬▬ ${categoria} ▬▬▬▬`, value: listaTreinos.join('\n\n'), inline: false });
            }

            return message.reply({ embeds: [painelTreinos] });
        }

        const treinoEscolhido = args[1].toLowerCase();

        if (!dbTreinos[treinoEscolhido]) {
            return message.reply('❌ Esse treinamento não existe. Digite apenas `!treino` para ver a lista.');
        }

        const infoTreino = dbTreinos[treinoEscolhido];
        let recompensaDinamica = infoTreino.recompensaDescricao;
        let infoJutsuElemento = 'outros'; 

        // ==========================================
        // 3. TRAVA DE STATUS (CAP POR RANK)
        // ==========================================
        const limitesRank = {
            'Rank E': { maxAtributo: 50, maxEnergia: 500 },
            'Rank D': { maxAtributo: 150, maxEnergia: 1500 },
            'Rank C': { maxAtributo: 300, maxEnergia: 3000 },
            'Rank B': { maxAtributo: 500, maxEnergia: 5000 },
            'Rank A': { maxAtributo: 800, maxEnergia: 8000 },
            'Rank S': { maxAtributo: 1200, maxEnergia: 12000 }
        };

        const rankUsuario = dados.rank || 'Rank E';
        const limitesAtuais = limitesRank[rankUsuario] || limitesRank['Rank E'];

        if (infoTreino.tipoRecompensa === 'atributo') {
            const valorExistente = dados[infoTreino.alvo] || 0;
            const ehEnergia = infoTreino.alvo === 'vidaMaxima' || infoTreino.alvo === 'chakraMaxima';
            const limiteMaximo = ehEnergia ? limitesAtuais.maxEnergia : limitesAtuais.maxAtributo;

            if (valorExistente >= limiteMaximo) {
                return message.reply(`❌ Seu corpo atingiu o limite de ${infoTreino.alvo} para o **${rankUsuario}** (Máximo: ${limiteMaximo}). Busque uma promoção para poder evoluir mais.`);
            }
        }

        // ==========================================
        // 4. LÓGICA DE APRENDER JUTSU
        // ==========================================
        if (infoTreino.tipoRecompensa === 'jutsu') {
            const nomeBuscado = args.slice(2).join(' ').toLowerCase();
            if (!nomeBuscado) {
                return message.reply('❌ Especifique o jutsu. Exemplo: `!treino jutsu bola de fogo`');
            }

            let achouJutsu = false;
            const pastaJutsus = './jutsus';
            if (fs.existsSync(pastaJutsus)) {
                const arquivos = fs.readdirSync(pastaJutsus).filter(f => f.endsWith('.json'));
                for (const arq of arquivos) {
                    const dadosJson = JSON.parse(fs.readFileSync(`${pastaJutsus}/${arq}`, 'utf-8'));
                    for (const [chave, objJutsu] of Object.entries(dadosJson)) {
                        if (objJutsu.nome && objJutsu.nome.toLowerCase() === nomeBuscado) {
                            recompensaDinamica = objJutsu.nome;
                            infoJutsuElemento = arq.replace('.json', ''); // Pega o nome do arquivo para saber a categoria
                            achouJutsu = true;
                            break;
                        }
                    }
                    if (achouJutsu) break;
                }
            }

            if (!achouJutsu) {
                return message.reply(`❌ O jutsu "**${nomeBuscado}**" não existe nos pergaminhos do servidor.`);
            }
        }

        // Lógica de Olhos (Mantida inalterada da última versão)
        const dojutsuAtual = dados.doujutsu || 'Nenhum';
        if (infoTreino.tipoRecompensa === 'dojutsu_despertar') {
            if (dojutsuAtual === 'Nenhum') return message.reply('❌ Você não possui genética ocular para despertar.');
            if (dojutsuAtual.includes('Sharingan') || dojutsuAtual.includes('Ketsuryūgan')) return message.reply('❌ **Bloqueado.** O despertar deste olho ocorre apenas por trauma emocional validado pela Staff.');
            
            let temCargoOlho = false;
            for (const idCargo of Object.values(config.cargosOrganizados.doujutsus || {})) {
                if (message.member.roles.cache.has(idCargo)) temCargoOlho = true;
            }
            if (temCargoOlho) return message.reply('❌ Seu Dōjutsu já está despertado.');
            recompensaDinamica = `${dojutsuAtual.replace(' (Não Despertado)', '')} (Nível 1)`;
        }

        if (infoTreino.tipoRecompensa === 'dojutsu_evoluir') {
            if (dojutsuAtual === 'Nenhum') return message.reply('❌ Você não possui genética ocular.');
            
            let possuiCargoDespertado = false;
            for (const idCargo of Object.values(config.cargosOrganizados.doujutsus || {})) {
                if (message.member.roles.cache.has(idCargo)) {
                    possuiCargoDespertado = true;
                    break;
                }
            }
            if (!possuiCargoDespertado) return message.reply('❌ Você ainda não possui o Dōjutsu despertado (Você não tem o cargo no Discord).');

            if (dojutsuAtual.includes('Sharingan')) {
                if (dojutsuAtual.includes('3 Tomoes') || dojutsuAtual.includes('Mangekyou')) return message.reply('❌ Seu Sharingan atingiu o limite de evolução por treino comum.');
                if (!dojutsuAtual.includes('Tomoe') || dojutsuAtual.includes('1 Tomoe')) recompensaDinamica = 'Sharingan (2 Tomoes)';
                else if (dojutsuAtual.includes('2 Tomoes')) recompensaDinamica = 'Sharingan (3 Tomoes)';
            } 
            else if (dojutsuAtual.includes('Byakugan') || dojutsuAtual.includes('Ketsuryūgan')) {
                if (dojutsuAtual.includes('Nível 4')) return message.reply('❌ Seu Dōjutsu já atingiu o Nível 4 (Máximo).');
                if (!dojutsuAtual.includes('Nível') || dojutsuAtual.includes('Nível 1')) recompensaDinamica = dojutsuAtual.split(' (')[0] + ' (Nível 2)';
                else if (dojutsuAtual.includes('Nível 2')) recompensaDinamica = dojutsuAtual.split(' (')[0] + ' (Nível 3)';
                else if (dojutsuAtual.includes('Nível 3')) recompensaDinamica = dojutsuAtual.split(' (')[0] + ' (Nível 4)';
            }
        }

        // Prodígio
        let reqCaracteres = infoTreino.caracteres;
        let tempoRoleplay = infoTreino.tempoRP;
        let bonusProdigio = 'Nenhum';

        if (dados.prodigio) {
            const sorteio = Math.random();
            if (sorteio < 0.5) {
                reqCaracteres = Math.floor(reqCaracteres * 0.85);
                bonusProdigio = 'Redução de 15% nos Caracteres Necessários';
            } else {
                tempoRoleplay = Math.max(1, Math.floor(tempoRoleplay * 0.85)); // Mínimo de 1 hora
                bonusProdigio = 'Redução de 15% no Tempo de RP';
            }
        }

        const embedInicio = new EmbedBuilder()
            .setColor('#2ECC71')
            .setTitle(`🏋️ Ficha de Exercício: ${infoTreino.nome}`)
            .setDescription(
                `Você está prestes a iniciar um treinamento. Consome **1 de ${LIMITE_TREINOS_DIA}** treinamentos diários.\n\n` +
                `🎯 **Objetivo:** ${infoTreino.funcao}\n` +
                `🏆 **Recompensa ao Aprovar:** \`${recompensaDinamica}\`\n` +
                `⏳ **Tempo consumido no Roleplay:** \`${tempoRoleplay} horas\`\n` +
                `📏 **Mínimo de Caracteres:** \`${reqCaracteres}\` caracteres\n\n` +
                (dados.prodigio ? `🌟 **Genética Prodígio Ativa:** \`${bonusProdigio}\`\n\n` : '') +
                `Escreva sua interpretação detalhada abaixo e envie a mensagem para finalizar.\n` +
                `*Se quiser desistir, digite \`cancelar\`.*`
            )
            .setImage(infoTreino.imagem || null);

        await message.reply({ embeds: [embedInicio] });

        const coletorTexto = canalOriginal.createMessageCollector({ filter: (m) => m.author.id === idUsuario, max: 1, time: 300000 });

        coletorTexto.on('collect', async (m) => {
            const conteudo = m.content.trim();

            if (conteudo.toLowerCase() === 'cancelar') {
                if (canalOriginal.id !== idChatComandosDedicado) return m.reply('❌ **Treino Cancelado.** Penalidade registrada (Cooldown ativo de 1 hora) por cancelar fora da área correta.');
                return m.reply('✅ Treino cancelado de forma segura.');
            }

            if (conteudo.length < reqCaracteres) {
                return m.reply(`❌ **Treino Reprovado Automaticamente.**\nVocê escreveu apenas ${conteudo.length} caracteres. O mínimo era ${reqCaracteres}.`);
            }

            // Gasta 1 "ficha" diária de treino assim que a pessoa envia o texto e o texto passa pela regra de caracteres
            perfis[idUsuario].historicoTreinos.push(Date.now());
            banco.salvar(perfis);

            await m.reply('🔮 **Texto capturado!** Atendeu aos requisitos de tamanho e foi enviado para a avaliação da staff. (Foi consumido 1 uso diário do seu cooldown).');

            let textoMaestrias = [];
            const mapaMaestrias = { ninjutsu: 'Ninjutsu', genjutsu: 'Genjutsu', taijutsu: 'Taijutsu', kenjutsu: 'Kenjutsu' }; 
            
            if (dados.maestrias) {
                for (const [chave, nivel] of Object.entries(dados.maestrias)) {
                    if (nivel > 0) {
                        textoMaestrias.push(`${mapaMaestrias[chave] || chave}: **${nivel}**`);
                    }
                }
            }
            const exibicaoMaestrias = textoMaestrias.length > 0 ? textoMaestrias.join(' | ') : 'Nenhuma';
            const exibicaoElementos = dados.elementos && dados.elementos.length > 0 ? dados.elementos.join(', ') : 'Nenhum';

            const canalAvaliacao = message.guild.channels.cache.get(idCanalAvaliacao);
            if (!canalAvaliacao) return canalOriginal.send('⚠️ Erro: Canal de avaliação não encontrado.');

            await canalAvaliacao.send(`📝 **TREINO DE <@${idUsuario}> - TIPO: ${infoTreino.nome.toUpperCase()}**\n\n${conteudo}`);

            const embedPainelAdm = new EmbedBuilder()
                .setColor('#3498DB')
                .setTitle('⚖️ Avaliação de Treinamento')
                .addFields(
                    { name: '🥷 Ninja', value: `<@${idUsuario}>`, inline: true },
                    { name: '🎯 Treino', value: infoTreino.nome, inline: true },
                    { name: '📏 Texto', value: `${conteudo.length} / ${reqCaracteres} necessários`, inline: true },
                    { name: '👁️ Dōjutsu', value: `${dojutsuAtual}`, inline: true },
                    { name: '✨ Elementos', value: exibicaoElementos, inline: true },
                    { name: '📜 Maestrias', value: exibicaoMaestrias, inline: false },
                    { name: '🏆 Recompensa Esperada', value: recompensaDinamica, inline: false }
                );

            // Passa dados vitais no botão para resolver tudo sem o banco no meio
            const stringRecompensaLimpa = recompensaDinamica.replace(/\s/g, '_').replace(/\(/g, '[').replace(/\)/g, ']');
            const customIdAprovar = `aprovar#${treinoEscolhido}#${idUsuario}#${stringRecompensaLimpa}#${infoJutsuElemento}`;
            const customIdReprovar = `reprovar#${idUsuario}`;

            const botoesAvaliacao = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId(customIdAprovar).setLabel('Aprovar Treino').setStyle(ButtonStyle.Success).setEmoji('✅'),
                new ButtonBuilder().setCustomId(customIdReprovar).setLabel('Reprovar Treino').setStyle(ButtonStyle.Danger).setEmoji('❌')
            );

            const msgPainelAdm = await canalAvaliacao.send({ embeds: [embedPainelAdm], components: [botoesAvaliacao] });

            const coletorBotoes = msgPainelAdm.createMessageComponentCollector({ componentType: ComponentType.Button, time: 86400000 });

            coletorBotoes.on('collect', async (interacao) => {
                if (!interacao.member.permissions.has('Administrator')) return interacao.reply({ content: '❌ Apenas administradores.', ephemeral: true });

                const partes = interacao.customId.split('#');
                const acao = partes[0];
                
                const botoesDesativados = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId('aprovado').setLabel('Avaliado').setStyle(ButtonStyle.Secondary).setDisabled(true)
                );

                if (acao === 'aprovar') {
                    const perfisAtualizados = banco.ler();
                    const perfilAt = perfisAtualizados[idUsuario];
                    const recompensaBotaoFormatada = partes[3] ? partes[3].replace(/_/g, ' ').replace(/\[/g, '(').replace(/\]/g, ')') : '';
                    
                    if (perfilAt) {
                        if (infoTreino.tipoRecompensa === 'atributo') {
                            const alvo = infoTreino.alvo;
                            perfilAt[alvo] = (perfilAt[alvo] || 0) + infoTreino.valorRecompensa;
                            if (alvo === 'vidaMaxima') perfilAt.vidaAtual = (perfilAt.vidaAtual || 0) + infoTreino.valorRecompensa;
                            if (alvo === 'chakraMaxima') perfilAt.chakraAtual = (perfilAt.chakraAtual || 0) + infoTreino.valorRecompensa;
                        } 
                        else if (infoTreino.tipoRecompensa === 'dojutsu_despertar' || infoTreino.tipoRecompensa === 'dojutsu_evoluir') {
                            perfilAt.doujutsu = recompensaBotaoFormatada;
                        }
                        else if (infoTreino.tipoRecompensa === 'maestria') {
                            const alvo = infoTreino.alvo;
                            if (!perfilAt.maestrias) perfilAt.maestrias = {};
                            perfilAt.maestrias[alvo] = (perfilAt.maestrias[alvo] || 0) + infoTreino.valorRecompensa;
                        }
                        else if (infoTreino.tipoRecompensa === 'jutsu') {
                            const categoriaJutsuBuscada = partes[4]; // O nome do arquivo .json (katon, outros, etc)
                            if (!perfilAt.jutsusAprendidos) perfilAt.jutsusAprendidos = {};
                            if (!perfilAt.jutsusAprendidos[categoriaJutsuBuscada]) perfilAt.jutsusAprendidos[categoriaJutsuBuscada] = [];
                            
                            // Adiciona o jutsu se não tiver ainda
                            if (!perfilAt.jutsusAprendidos[categoriaJutsuBuscada].includes(recompensaBotaoFormatada)) {
                                perfilAt.jutsusAprendidos[categoriaJutsuBuscada].push(recompensaBotaoFormatada);
                            }
                        }
                        
                        banco.salvar(perfisAtualizados);
                    }

                    const embedAprovado = EmbedBuilder.from(embedPainelAdm).setColor('#2ECC71').setFooter({ text: `Aprovado por: ${interacao.user.username}` });
                    await interacao.update({ embeds: [embedAprovado], components: [botoesDesativados] });

                    await canalOriginal.send(`📢 <@${idUsuario}>, seu treino **${infoTreino.nome}** foi **APROVADO**! 🎉\nRecompensa entregue: ${recompensaBotaoFormatada || infoTreino.recompensaDescricao}`).catch(() => {});
                    coletorBotoes.stop();
                } 
                else if (acao === 'reprovar') {
                    // Como foi reprovado pela staff, devolvemos a "ficha" de uso diário pro jogador pra ele poder treinar de novo hoje
                    const perfisAtualizados = banco.ler();
                    if (perfisAtualizados[idUsuario] && perfisAtualizados[idUsuario].historicoTreinos) {
                        perfisAtualizados[idUsuario].historicoTreinos.pop(); // Tira a marcação de uso
                        banco.salvar(perfisAtualizados);
                    }

                    const embedReprovado = EmbedBuilder.from(embedPainelAdm).setColor('#E74C3C').setFooter({ text: `Reprovado por: ${interacao.user.username}` });
                    await interacao.update({ embeds: [embedReprovado], components: [botoesDesativados] });

                    await canalOriginal.send(`📢 <@${idUsuario}>, seu treino foi **REPROVADO** pela staff. ❌ Melhore a escrita e tente novamente. (A tentativa diária foi devolvida).`).catch(() => {});
                    coletorBotoes.stop();
                }
            });
        });

        coletorTexto.on('end', (collected, reason) => {
            if (reason === 'time') canalOriginal.send(`⏳ <@${idUsuario}>, o tempo limite expirou.`);
        });
    }
};