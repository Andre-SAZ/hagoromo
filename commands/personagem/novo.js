const fs = require('fs');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const config = require('../../config.json');
const banco = require('../../banco.js');

module.exports = {
    nome: '!novo',

    async executar(message) {
        const perfis = banco.ler();
        if (perfis[message.author.id]) {
            return message.reply('❌ Você já possui um perfil ninja criado! Use `!reset confirmar` para apagar e recomeçar.');
        }

        const filtro = (m) => m.author.id === message.author.id;
        const opcoes = { max: 1, time: 120000, errors: ['time'] };

        try {
            // ==========================================
            // PASSO 1: NOME E IDADE
            // ==========================================
            const embedPasso1 = new EmbedBuilder()
                .setColor('#2F3136')
                .setTitle('📜 Registro Ninja - Passo 1/3')
                .setDescription('Digite seu **Nome** e **Idade** separados por espaço.\n*Exemplo: Naruto 12*');

            await message.reply({ embeds: [embedPasso1] });
            const resposta1 = await message.channel.awaitMessages({ filter: filtro, ...opcoes });
            const texto1 = resposta1.first().content.trim().split(' ');

            if (texto1.length < 2) return message.reply('⚠️ Formato incorreto. Cancele e tente `!novo` novamente.');

            const nome = texto1[0];
            const idade = texto1[1];

            // ==========================================
            // PASSO 2: O CARROSSEL DO DESTINO
            // ==========================================
            const caminhoClas = './clas.json';
            if (!fs.existsSync(caminhoClas)) {
                return message.reply('❌ O arquivo `clas.json` não foi encontrado. Avise um Administrador.');
            }
            const dbClas = JSON.parse(fs.readFileSync(caminhoClas, 'utf-8'));
            const listaClas = Object.keys(dbClas);

            const clasSorteados = listaClas.sort(() => 0.5 - Math.random()).slice(0, 5);
            let indexAtual = 0;

            const gerarEmbedCarrossel = (index) => {
                const nomeCla = clasSorteados[index];
                const info = dbClas[nomeCla];

                return new EmbedBuilder()
                    .setColor('#F1C40F')
                    .setTitle(`⛩️ Sorteio do Destino: Opção ${index + 1} de 5`)
                    .setDescription(`Os deuses rolaram os dados e lhe deram estas 5 opções.\n\n**${info.nome}**\n${info.descricao}\n\n**Vantagens**\n${info.vantagensDescricao}`)
                    .setThumbnail(info.thumbnail)
                    .setImage(info.imagem)
                    .setFooter({ text: 'Use as setas para navegar e clique em Escolher.' });
            };

            const botoesCarrossel = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('anterior').setLabel('◀️ Anterior').setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId('confirmar').setLabel('✅ Escolher Este').setStyle(ButtonStyle.Success),
                new ButtonBuilder().setCustomId('proximo').setLabel('Próximo ▶️').setStyle(ButtonStyle.Secondary)
            );

            const msgCarrossel = await message.reply({ embeds: [gerarEmbedCarrossel(0)], components: [botoesCarrossel] });

            const claEscolhido = await new Promise((resolve, reject) => {
                const coletorCla = msgCarrossel.createMessageComponentCollector({ filter: i => i.user.id === message.author.id, time: 120000 });

                coletorCla.on('collect', async (i) => {
                    if (i.customId === 'anterior') {
                        indexAtual = indexAtual === 0 ? 4 : indexAtual - 1;
                        await i.update({ embeds: [gerarEmbedCarrossel(indexAtual)] });
                    }
                    else if (i.customId === 'proximo') {
                        indexAtual = indexAtual === 4 ? 0 : indexAtual + 1;
                        await i.update({ embeds: [gerarEmbedCarrossel(indexAtual)] });
                    }
                    else if (i.customId === 'confirmar') {
                        const escolha = clasSorteados[indexAtual];
                        await i.update({ embeds: [], components: [], content: `✅ Seu destino está selado! Você nasceu no **${escolha}**.` });
                        coletorCla.stop('escolhido');
                        resolve(escolha);
                    }
                });

                coletorCla.on('end', (collected, reason) => {
                    if (reason !== 'escolhido') reject('tempo_esgotado');
                });
            });

            // ==========================================
            // PASSO 3: IMAGEM
            // ==========================================
            const embedPasso3 = new EmbedBuilder()
                .setColor('#2F3136')
                .setTitle('🖼️ Registro Ninja - Passo 3/3')
                .setDescription('Envie o **link da imagem** ou faça o **upload da foto**.');

            await message.channel.send({ embeds: [embedPasso3] });
            const respostaImagem = await message.channel.awaitMessages({ filter: filtro, ...opcoes });

            const anexo = respostaImagem.first().attachments.first();
            const linkImagem = anexo ? anexo.url : respostaImagem.first().content.trim();

            // ==========================================
            // LÓGICA DE ATRIBUTOS
            // ==========================================
            let vida = 100, chakra = 100, forca = 0, agilidade = 0, defesa = 0;
            let isProdigio = Math.random() < (1 / 9);
            let doujutsu = 'Nenhum', kekkei = 'Nenhuma', hiden = 'Nenhum', estiloLuta = 'Básico';
            let elementosSorteados = [];
            let maestriasIniciais = [];
            let vantagensExclusivas = [];

            const todosElementos = ['katon', 'suiton', 'fuuton', 'doton', 'raiton'];
            const sortearElementoUnico = (excluir = []) => {
                const disponiveis = todosElementos.filter(e => !excluir.includes(e));
                if (disponiveis.length === 0) return null;
                return disponiveis[Math.floor(Math.random() * disponiveis.length)];
            };
            const sortearChance = (por) => Math.random() * 100 < por;

            // Define as vantagens e agora ajusta corretamente os Nomes dos Estilos de Luta
            switch (claEscolhido) {
                case 'Clã Uchiha':
                    doujutsu = 'Sharingan (Não Despertado)'; elementosSorteados.push('katon');
                    if (sortearChance(30)) elementosSorteados.push(sortearElementoUnico(['katon']));
                    isProdigio = Math.random() < (1 / 8); break;
                case 'Clã Uzumaki':
                    chakra = 200; vida = 150; break;
                case 'Clã Hyuuga':
                    doujutsu = 'Byakugan (Não Despertado)'; estiloLuta = 'Punho Suave (Jūken)'; break;
                case 'Clã Nara':
                    hiden = 'Kage no Houjutsu'; break;
                case 'Clã Yamanaka':
                    hiden = 'Shintenshin no Jutsu'; break;
                case 'Linhagem de Guardiões':
                    vantagensExclusivas.push('Acesso a Katon: Tenrou'); break;
                case 'Clã Aburame':
                    hiden = 'Kikaichū no Jutsu'; break;
                case 'Clã Akimichi':
                    hiden = 'Karorī Kontorōru'; break;
                case 'Clã Chinoike':
                    doujutsu = 'Ketsuryūgan (Não Despertado)'; break;
                case 'Clã Juugo':
                    forca += 5; chakra += 50; vida += 25; break;
                case 'Clã Kazekage':
                    const rKaze = Math.random() * 100;
                    if (rKaze < 60) { elementosSorteados.push('fuuton'); vantagensExclusivas.push('Acesso a 2 Jutsus Rank Superior'); }
                    else if (rKaze < 90) { estiloLuta = 'Técnica de Marionetes'; }
                    else {
                        elementosSorteados.push('fuuton');
                        const rMag = Math.random() * 100;
                        if (rMag < 50) kekkei = 'Magnetismo (Areia)';
                        else if (rMag < 80) kekkei = 'Magnetismo (Ferro)';
                        else kekkei = 'Magnetismo (Ouro)';
                    }
                    break;
                case 'Clã Raikage':
                    elementosSorteados.push('raiton'); estiloLuta = 'Nintaijutsu'; vantagensExclusivas.push('Acesso a Jutsus de Raikage'); break;
                case 'Clã Hatake':
                    isProdigio = Math.random() < 0.5; elementosSorteados.push(sortearElementoUnico());
                    if (sortearChance(80)) elementosSorteados.push(sortearElementoUnico(elementosSorteados)); break;
                case 'Clã Hoozuki':
                    elementosSorteados.push('suiton'); vantagensExclusivas.push('Suika no Jutsu'); break;
                case 'Clã Hoshigaki':
                    chakra = 400; break;
                case 'Clã Izuno':
                    hiden = 'Ninpou: Nekokaburi'; break;
                case 'Clã Kaguya':
                    kekkei = 'Shikotsumyaku'; break;
                case 'Clã Lee':
                    estiloLuta = 'Punho Forte (Gōken)'; maestriasIniciais.push('taijutsu'); forca += 3; agilidade += 3; break;
                case 'Clã Sarutobi':
                    if (sortearChance(50)) maestriasIniciais.push('kenjutsu');
                    if (sortearChance(80)) maestriasIniciais.push('ninjutsu');
                    elementosSorteados.push(sortearElementoUnico());
                    let chanceE = 100;
                    while (sortearChance(chanceE) && elementosSorteados.length < 5) {
                        const novoElem = sortearElementoUnico(elementosSorteados);
                        if (novoElem) elementosSorteados.push(novoElem);
                        chanceE /= 2;
                    }
                    break;
                case 'Clã Senju':
                    const rSenju = Math.random() * 100;
                    if (rSenju < 50) {
                        maestriasIniciais.push('taijutsu');
                        forca += 1;
                        chakra += 30;
                        elementosSorteados.push(sortearElementoUnico()); // Adiciona o elemento básico
                    }
                    else if (rSenju < 90) {
                        isProdigio = Math.random() < 0.5;
                        maestriasIniciais.push('ninjutsu', 'fluxoDeChakra', 'kenjutsu');
                        elementosSorteados.push(sortearElementoUnico()); // Adiciona o elemento básico
                    }
                    else {
                        elementosSorteados.push('suiton', 'doton');
                        kekkei = 'Estilo Madeira';
                    }
                    break;
                case 'Clã Yuki':
                    elementosSorteados.push('suiton', 'fuuton'); kekkei = 'Estilo Gelo';
                    if (sortearChance(40)) maestriasIniciais.push('ninjutsu'); break;
                case 'Família dos B':
                    estiloLuta = 'Acrobata (Akurobatto)'; elementosSorteados.push('raiton'); maestriasIniciais.push('kenjutsu', 'taijutsu'); break;
                default:
                    elementosSorteados.push(sortearElementoUnico()); break;
            }

            // ==========================================
            // ATUALIZAÇÃO DOS CARGOS NO DISCORD
            // ==========================================
            const cargosParaAdicionar = [];

            const cargoCla = message.guild.roles.cache.find(r => r.name === claEscolhido);
            if (cargoCla) cargosParaAdicionar.push(cargoCla.id);

            const chaveEstudante = Object.keys(config.cargosOrganizados.patentes).find(k => k.toLowerCase().includes('estudante'));
            if (chaveEstudante && config.cargosOrganizados.patentes[chaveEstudante]) {
                cargosParaAdicionar.push(config.cargosOrganizados.patentes[chaveEstudante]);
            }

            for (const elem of elementosSorteados) {
                const chaveElem = Object.keys(config.cargosOrganizados.elementos).find(k => k.toLowerCase().includes(elem));
                if (chaveElem && config.cargosOrganizados.elementos[chaveElem]) {
                    cargosParaAdicionar.push(config.cargosOrganizados.elementos[chaveElem]);
                }
            }

            if (doujutsu !== 'Nenhum') {
                const doujutsuBase = doujutsu.split(' (')[0];
                const chaveD = doujutsuBase.normalize('NFD').replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9]/g, '');
                if (config.cargosOrganizados.doujutsus && config.cargosOrganizados.doujutsus[chaveD]) {
                    cargosParaAdicionar.push(config.cargosOrganizados.doujutsus[chaveD]);
                }
            }

            if (kekkei !== 'Nenhuma') {
                const chaveK = kekkei.normalize('NFD').replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9]/g, '');
                if (config.cargosOrganizados.kekkeigenkai && config.cargosOrganizados.kekkeigenkai[chaveK]) {
                    cargosParaAdicionar.push(config.cargosOrganizados.kekkeigenkai[chaveK]);
                }
            }

            // ADICIONA O CARGO DO ESTILO DE LUTA SE NÃO FOR BÁSICO
            if (estiloLuta !== 'Básico') {
                const chaveEstilo = estiloLuta.normalize('NFD').replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9]/g, '');
                if (config.cargosOrganizados.estilosLuta && config.cargosOrganizados.estilosLuta[chaveEstilo]) {
                    cargosParaAdicionar.push(config.cargosOrganizados.estilosLuta[chaveEstilo]);
                }
            }

            for (const maestria of maestriasIniciais) {
                const chaveM = `Maestriaem${maestria.charAt(0).toUpperCase() + maestria.slice(1)}`;
                if (config.cargosOrganizados.maestrias && config.cargosOrganizados.maestrias[chaveM]) {
                    cargosParaAdicionar.push(config.cargosOrganizados.maestrias[chaveM]);
                }
            }

            message.guild.roles.cache.forEach(cargo => {
                if (cargo.name.includes('▬')) {
                    cargosParaAdicionar.push(cargo.id);
                }
            });

            if (cargosParaAdicionar.length > 0) {
                await message.member.roles.add(cargosParaAdicionar).catch(() => { });
            }

            // ==========================================
            // SALVA NO BANCO DE DADOS
            // ==========================================
            const jutsusA = { katon: [], fuuton: [], doton: [], raiton: [], suiton: [], outros: [] };
            const maestriasFinal = {
                ninjutsu: maestriasIniciais.includes('ninjutsu') ? 1 : 0, genjutsu: 0, taijutsu: maestriasIniciais.includes('taijutsu') ? 1 : 0,
                bunshinjutsu: 0, fluxoDeChakra: maestriasIniciais.includes('fluxoDeChakra') ? 1 : 0, fuuinjutsu: 0, hiden: 0, juinjutsu: 0, jujutsu: 0, kekkaijutsu: 0,
                kenjutsu: maestriasIniciais.includes('kenjutsu') ? 1 : 0, kinjutsu: 0, konbijutsu: 0, kyuuinjutsu: 0, ninjutsuEspacoTempo: 0,
                ninjutsuMedico: 0, nintaijutsu: 0, senjutsu: 0, shurikenjutsu: 0, tenseijutsu: 0
            };

            perfis[message.author.id] = {
                nome: nome, cla: claEscolhido, idade: idade, rank: 1, prodigio: isProdigio,
                elementos: elementosSorteados, kekkei: kekkei, doujutsu: doujutsu, hiden: hiden, estiloLuta: estiloLuta,
                vantagens: vantagensExclusivas, imagem: linkImagem, vidaAtual: vida, vidaMaxima: vida, chakraAtual: chakra, chakraMaxima: chakra,
                ryos: 0, forca: forca, agilidade: agilidade, defesa: defesa, jutsusAprendidos: jutsusA, maestrias: maestriasFinal
            };

            banco.salvar(perfis);

            message.channel.send(`✅ **Ficha Criada com Sucesso!**\nOs deuses ninjas decidiram seu destino. Você ${isProdigio ? '🌟 **NASCEU UM PRODÍGIO**' : 'é um ninja promissor'}. Digite \`!status\` para conferir!`);

        } catch (erro) {
            if (erro === 'tempo_esgotado') {
                message.reply('⏳ O tempo esgotou. Tente `!novo` novamente.');
            } else {
                message.reply('⏳ Erro inesperado. Tente usar `!novo` novamente.');
                console.error(erro);
            }
        }
    }
};