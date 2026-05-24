const { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, StringSelectMenuBuilder } = require('discord.js');
const config = require('../config.json');
const banco = require('../banco.js');

module.exports = {
    nome: '!novo',

    async executar(message) {
        // ==========================================
        // TRAVA DE SEGURANÇA: USUÁRIO JÁ EXISTE?
        // ==========================================
        const perfis = banco.ler();
        if (perfis[message.author.id]) {
            return message.reply('❌ Você já possui um perfil ninja criado! Se quiser começar do zero, use o comando `!reset confirmar` primeiro.');
        }

        const filtro = (m) => m.author.id === message.author.id;
        const opcoes = { max: 1, time: 120000, errors: ['time'] };

        try {
            // ==========================================
            // PASSO 1: NOME E IDADE
            // ==========================================
            await message.reply('Criando perfil! 🥷\n**Passo 1/4:** Digite apenas seu **Nome** e **Idade** (Ex: *Naruto 12*).');
            const resposta1 = await message.channel.awaitMessages({ filter: filtro, ...opcoes });
            const texto1 = resposta1.first().content.trim().split(' ');

            if (texto1.length < 2) return message.reply('⚠️ Formato incorreto. Tente `!novo` novamente.');
            
            const nome = texto1[0];
            const idade = texto1[1];

            // ==========================================
            // PASSO 2: MENU SUSPENSO DE CLÃS
            // ==========================================
            const listaClas = [
                'Clã Aburame', 'Clã Akimichi', 'Clã Chinoike', 'Clã Juugo', 
                'Clã Kazekage', 'Clã Raikage', 'Clã Hatake', 'Clã Hoozuki', 
                'Clã Hoshigaki', 'Clã Hyuuga', 'Clã Inuzuka', 'Clã Izuno', 
                'Clã Kaguya', 'Clã Lee', 'Clã Nara', 'Clã Sarutobi', 
                'Clã Senju', 'Clã Shimura', 'Clã Uchiha', 'Clã Uzumaki', 
                'Clã Yamanaka', 'Clã Yuki', 'Família dos B', 'Linhagem de Guardiões'
            ];

            // Monta as opções para o menu do Discord
            const opcoesMenu = listaClas.map(cla => ({ label: cla, value: cla }));

            const menuClas = new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('selecao_cla')
                    .setPlaceholder('Clique aqui para selecionar seu Clã ou Linhagem')
                    .addOptions(opcoesMenu)
            );

            const msgMenu = await message.reply({ 
                content: '**Passo 2/4:** Escolha o seu Clã na lista abaixo:', 
                components: [menuClas] 
            });

            const interacaoMenu = await msgMenu.awaitMessageComponent({ 
                filter: i => i.user.id === message.author.id, 
                time: 60000, 
                componentType: ComponentType.StringSelect 
            });

            const claEscolhido = interacaoMenu.values[0];
            await interacaoMenu.update({ content: `Clã **${claEscolhido}** selecionado! ✅`, components: [] });

            // Dá o cargo do Clã no Discord
            const cargoCla = message.guild.roles.cache.find(r => r.name === claEscolhido);
            if (cargoCla) await message.member.roles.add(cargoCla);

            // ==========================================
            // PASSO 3: BOTÕES DE ELEMENTO
            // ==========================================
            const botoesElementos = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('katon').setLabel('🔥 Katon').setStyle(ButtonStyle.Danger),
                new ButtonBuilder().setCustomId('suiton').setLabel('💧 Suiton').setStyle(ButtonStyle.Primary),
                new ButtonBuilder().setCustomId('fuuton').setLabel('🌪️ Fuuton').setStyle(ButtonStyle.Success),
                new ButtonBuilder().setCustomId('doton').setLabel('🪨 Doton').setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId('raiton').setLabel('⚡ Raiton').setStyle(ButtonStyle.Secondary)
            );

            const msgBotoes = await message.reply({ 
                content: '**Passo 3/4:** Escolha a sua Afinidade Elemental básica:', 
                components: [botoesElementos] 
            });

            const interacaoBotao = await msgBotoes.awaitMessageComponent({ 
                filter: i => i.user.id === message.author.id, 
                time: 60000, 
                componentType: ComponentType.Button 
            });

            const elementoEscolhido = interacaoBotao.customId;
            const nomeExibicaoElemento = config.nomesExibicao[elementoEscolhido] || elementoEscolhido.toUpperCase();

            await interacaoBotao.update({ content: `Elemento **${nomeExibicaoElemento}** selecionado! ✅`, components: [] });

            // Dá o cargo do Elemento no Discord
            const idCargoElemento = config.cargosOrganizados.elementos[Object.keys(config.cargosOrganizados.elementos).find(k => k.toLowerCase().includes(elementoEscolhido))];
            if (idCargoElemento) {
                const cargoElemento = message.guild.roles.cache.get(idCargoElemento);
                if (cargoElemento) await message.member.roles.add(cargoElemento);
            }

            // ==========================================
            // PASSO 4: IMAGEM
            // ==========================================
            await message.channel.send('**Passo 4/4:** Envie o **Link da imagem** (URL) do seu personagem.');
            const respostaImagem = await message.channel.awaitMessages({ filter: filtro, ...opcoes });
            const linkImagem = respostaImagem.first().content.trim();

            // ==========================================
            // ENTREGA DO CARGO DE ESTUDANTE E SALVAMENTO
            // ==========================================
            // Dá o cargo de Estudante
            const chaveEstudante = Object.keys(config.cargosOrganizados.patentes).find(k => k.toLowerCase().includes('estudante'));
            const idEstudante = config.cargosOrganizados.patentes[chaveEstudante];
            if (idEstudante) {
                const cargoEstudante = message.guild.roles.cache.get(idEstudante);
                if (cargoEstudante) await message.member.roles.add(cargoEstudante);
            }

            let vidaBase = 100;
            let chakraBase = 100;

            if (claEscolhido.toLowerCase().includes('uzumaki')) {
                vidaBase = 150;
                chakraBase = 200;
            }

            const novoPerfil = {
                nome: nome,
                cla: claEscolhido,
                idade: idade,
                rank: 'Rank E', // Iniciando no nível de Estudante
                elementos: elementoEscolhido, 
                kekkei: 'Nenhuma',
                doujutsu: 'Nenhum',
                imagem: linkImagem,
                vidaAtual: vidaBase,
                vidaMaxima: vidaBase,
                chakraAtual: chakraBase,
                chakraMaxima: chakraBase,
                ryos: 0,
                forca: 1,
                agilidade: 1,
                defesa: 1,
                jutsusAprendidos: {
                    katon: [], fuuton: [], doton: [], raiton: [], suiton: [], outros: []
                },
                // Banco de maestrias todas em nível 0
                maestrias: {
                    ninjutsu: 0, genjutsu: 0, taijutsu: 0,
                    bunshinjutsu: 0, fluxoDeChakra: 0, fuuinjutsu: 0,
                    hiden: 0, juinjutsu: 0, jujutsu: 0,
                    kekkaijutsu: 0, kenjutsu: 0, kinjutsu: 0,
                    konbijutsu: 0, kyuuinjutsu: 0, ninjutsuEspacoTempo: 0,
                    ninjutsuMedico: 0, nintaijutsu: 0, senjutsu: 0,
                    shurikenjutsu: 0, tenseijutsu: 0
                }
            };

            perfis[message.author.id] = novoPerfil;
            banco.salvar(perfis);

            message.channel.send(`✅ Ficha concluída! Você recebeu os cargos automáticos e foi graduado a **Estudante**. Use \`!status\` para ver o resultado.`);

        } catch (erro) {
            message.reply('⏳ Tempo esgotado ou ocorreu um erro. Tente usar `!novo` novamente.');
            console.error(erro);
        }
    }
};