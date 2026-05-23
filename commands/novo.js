const fs = require('fs');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');

module.exports = {
    nome: '!novo',

    async executar(message) {
        const filtro = (m) => m.author.id === message.author.id;
        const opcoes = { max: 1, time: 120000, errors: ['time'] };

        try {
            // ==========================================
            // PASSO 1: NOME, CLÃ E IDADE
            // ==========================================
            await message.reply('Criando perfil! 🥷\n**Passo 1/5:** Digite seu **Nome**, **Clã** e **Idade** (Ex: *Kyuubi Uzumaki 12*).');
            const resposta1 = await message.channel.awaitMessages({ filter: filtro, ...opcoes });
            const texto1 = resposta1.first().content.trim().split(' ');

            if (texto1.length < 3) return message.reply('⚠️ Formato incorreto. Tente `!novo` novamente.');
            
            const nome = texto1[0];
            const claDigitado = texto1[1];
            const idade = texto1[2];

            // ==========================================
            // PASSO 2: BOTÕES DE ELEMENTO
            // ==========================================
            const botoesElementos = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('katon').setLabel('🔥 Katon').setStyle(ButtonStyle.Danger),
                new ButtonBuilder().setCustomId('suiton').setLabel('💧 Suiton').setStyle(ButtonStyle.Primary),
                new ButtonBuilder().setCustomId('fuuton').setLabel('🌪️ Fuuton').setStyle(ButtonStyle.Success),
                new ButtonBuilder().setCustomId('doton').setLabel('🪨 Doton').setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId('raiton').setLabel('⚡ Raiton').setStyle(ButtonStyle.Secondary)
            );

            const msgBotoes = await message.reply({ 
                content: '**Passo 2/5:** Escolha o seu Elemento clicando em um dos botões abaixo:', 
                components: [botoesElementos] 
            });

            const filtroBotao = i => i.user.id === message.author.id;
            
            const interacaoBotao = await msgBotoes.awaitMessageComponent({ 
                filter: filtroBotao, 
                time: 60000, 
                componentType: ComponentType.Button 
            });

            const elementoEscolhido = interacaoBotao.customId;

            await interacaoBotao.update({ 
                content: `Elemento **${elementoEscolhido.toUpperCase()}** selecionado! ✅`, 
                components: [] 
            });

            // ==========================================
            // MAPEAMENTO DE IDS DOS CARGOS DE ELEMENTO
            // ==========================================
            const idsCargosElementos = {
                katon: '1507646623247896687',
                suiton: '1507646666596024451',
                fuuton: '1507646727380013056',
                doton: '1507646759210582016',
                raiton: '1507646809810538637'
            };

            const idCargoExato = idsCargosElementos[elementoEscolhido];

            // Busca o cargo diretamente pelo ID fornecido
            const cargoElemento = message.guild.roles.cache.get(idCargoExato);
            
            if (cargoElemento) {
                await message.member.roles.add(cargoElemento);
            } else {
                message.channel.send('⚠️ Aviso: O cargo do elemento selecionado não foi encontrado no servidor através do ID.');
            }

            // ==========================================
            // PASSO 3: KEKKEI-GENKAI
            // ==========================================
            await message.channel.send(`**Passo 3/5:** Digite sua **Kekkei-Genkai** (Ex: *Sharingan* ou *Nenhuma*).`);
            const resposta3 = await message.channel.awaitMessages({ filter: filtro, ...opcoes });
            const kekkei = resposta3.first().content.trim();

            // ==========================================
            // PASSO 4: MAESTRIAS
            // ==========================================
            await message.channel.send('**Passo 4/5:** Digite suas **Maestrias** (Ex: *Ninjutsu e Taijutsu*).');
            const resposta4 = await message.channel.awaitMessages({ filter: filtro, ...opcoes });
            const maestrias = resposta4.first().content.trim();

            // ==========================================
            // PASSO 5: IMAGEM
            // ==========================================
            await message.channel.send('**Passo 5/5:** Envie o **Link de imagem** (URL) do seu personagem.');
            const resposta5 = await message.channel.awaitMessages({ filter: filtro, ...opcoes });
            const linkImagem = resposta5.first().content.trim();

            // ==========================================
            // ENTREGA DO CARGO DE ESTUDANTE E SALVAMENTO
            // ==========================================
            const idCargoEstudante = '1507646871974187160';
            const cargoEstudante = message.guild.roles.cache.get(idCargoEstudante);
            
            if (cargoEstudante) {
                await message.member.roles.add(cargoEstudante);
            } else {
                message.channel.send('⚠️ Aviso: O cargo Estudante não foi encontrado no servidor através do ID.');
            }


            let vidaBase = 100;
            let chakraBase = 100;

            if (claDigitado.toLowerCase() === 'uzumaki') {
                vidaBase = 150;
                chakraBase = 200;
            }

            const novoPerfil = {
                nome: nome,
                cla: claDigitado,
                idade: idade,
                elementos: elementoEscolhido, 
                kekkei: kekkei,
                maestrias: maestrias,
                imagem: linkImagem,
                
                // NOVO SISTEMA DE STATUS
                vidaAtual: vidaBase,
                vidaMaxima: vidaBase,
                chakraAtual: chakraBase,
                chakraMaxima: chakraBase,
                
                ryos: 0,
                forca: 1,
                agilidade: 1,
                defesa: 1,
                jutsusAprendidos: {
                    katon: [],
                    fuuton: [],
                    doton: [],
                    raiton: [],
                    suiton: [],
                    outros: []
                }
            };

            const dadosArquivo = fs.readFileSync('./perfis.json', 'utf-8');
            const perfis = JSON.parse(dadosArquivo);

            perfis[message.author.id] = novoPerfil;
            fs.writeFileSync('./perfis.json', JSON.stringify(perfis, null, 2));

            message.channel.send(`✅ Ficha concluída! Você recebeu os cargos automáticos. Use \`!mostrarperfil\` para ver o resultado.`);

        } catch (erro) {
            message.reply('⏳ Tempo esgotado ou ocorreu um erro. Tente usar `!novo` novamente.');
            console.error(erro);
        }
    }
};