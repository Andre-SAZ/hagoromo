const fs = require('fs');

module.exports = {
    nome: '!configsv',

    async executar(message) {
        if (!message.member.permissions.has('Administrator')) {
            return message.reply('❌ Apenas administradores do servidor podem usar este comando.');
        }

        await message.reply('⚙️ Iniciando a configuração mestre atualizada... Criando clãs, poderes e patentes! ⏳');

        // ==========================================
        // PARTE 1: LISTA DE TODOS OS CARGOS
        // ==========================================
        const cargosElementos = [
            { nome: '🔥 Katon', cor: '#FF4500' },
            { nome: '💧 Suiton', cor: '#1E90FF' },
            { nome: '🌪️ Fuuton', cor: '#00FF7F' },
            { nome: '🪨 Doton', cor: '#8B4513' },
            { nome: '⚡ Raiton', cor: '#FFD700' }
        ];

        // Nova lista de Hierarquia/Patentes ninjas
        const listaPatentes = [
            'Estudante', 'Genin', 'Chuunin', 'Tokubetsu Jounin', 
            'Jounin', 'ANBU', 'Kage', 'Nukenin', 'Mercenário'
        ];

        const listaClas = [
            'Clã Aburame', 'Clã Akimichi', 'Clã Chinoike', 'Clã Juugo', 
            'Clã Kazekage', 'Clã Raikage', 'Clã Hatake', 'Clã Hoozuki', 
            'Clã Hoshigaki', 'Clã Hyuuga', 'Clã Inuzuka', 'Clã Izuno', 
            'Clã Kaguya', 'Clã Lee', 'Clã Nara', 'Clã Sarutobi', 
            'Clã Senju', 'Clã Shimura', 'Clã Uchiha', 'Clã Uzumaki', 
            'Clã Yamanaka', 'Clã Yuki', 'Família dos B', 'Linhagem de Guardiões'
        ];

        const listaMaestrias = [
            'Maestria em Ninjutsu', 'Maestria em Genjutsu', 'Maestria em Taijutsu',
            'Maestria em Bunshinjutsu', 'Maestria em Fluxo de Chakra', 'Maestria em Fuuinjutsu',
            'Maestria em Hiden', 'Maestria em Juinjutsu', 'Maestria em Jujutsu',
            'Maestria em Kekkaijutsu', 'Maestria em Kenjutsu', 'Maestria em Kinjutsu',
            'Maestria em Konbijutsu', 'Maestria em Kyuuinjutsu', 'Maestria em Ninjutsu Espaço-Tempo',
            'Maestria em Ninjutsu Médico', 'Maestria em Nintaijutsu', 'Maestria em Senjutsu',
            'Maestria em Shurikenjutsu', 'Maestria em Tenseijutsu'
        ];

        const listaKekkei = [
            'Estilo Calor', 'Estilo Chama', 'Estilo Cristal', 'Estilo Dissolução', 
            'Estilo Ebulição', 'Estilo Espuma', 'Estilo Explosão', 'Estilo Fusão', 
            'Estilo Gelo', 'Estilo Lama', 'Estilo Madeira', 'Estilo Magnetismo (Ouro)', 
            'Estilo Magnetismo (Ferro)', 'Estilo Magnetismo (Areia)', 'Estilo Tempestade', 
            'Estilo Tufão', 'Estilo Pó'
        ];

        const listaDoujutsu = [
            'Byakugan', 'Tenseigan', 'Kokugan', 'Jougan', 
            'Rinnegan', 'Rinnegan Supremo', 'Rinne Sharingan', 'Sharingan', 
            'Mangekyou Sharingan', 'Senrigan', 'Dōjutsu Implantado'
        ];

        // ==========================================
        // PARTE 2: CRIAR CARGOS NO DISCORD
        // ==========================================
        let criados = 0;

        // Cria Elementos
        for (const base of cargosElementos) {
            const existe = message.guild.roles.cache.some(r => r.name === base.nome);
            if (!existe) {
                await message.guild.roles.create({ name: base.nome, color: base.cor });
                criados++;
            }
        }

        // Função para criar os outros grupos de cargos
        const criarGrupo = async (lista, cor) => {
            for (const nome of lista) {
                const existe = message.guild.roles.cache.some(r => r.name.toLowerCase() === nome.toLowerCase());
                if (!existe) {
                    await message.guild.roles.create({ name: nome, color: cor });
                    criados++;
                }
            }
        };

        await criarGrupo(listaPatentes, '#34495E'); // Cor Cinza Escuro para Patentes
        await criarGrupo(listaClas, null); 
        await criarGrupo(listaMaestrias, '#9B59B6'); 
        await criarGrupo(listaKekkei, '#2ECC71'); 
        await criarGrupo(listaDoujutsu, '#E74C3C'); 

        if (criados > 0) {
            message.channel.send(`✅ **${criados}** novos cargos foram gerados! Atualizando e sincronizando o \`config.json\`...`);
        }

        // ==========================================
        // PARTE 3: ORGANIZAR NO CONFIG.JSON
        // ==========================================
        try {
            const caminhoConfig = './config.json';
            
            let config = { cores: {}, emojis: {}, cargos: {} };
            if (fs.existsSync(caminhoConfig)) {
                config = JSON.parse(fs.readFileSync(caminhoConfig, 'utf-8'));
            }

            // Gavetas atualizadas incluindo as Patentes
            config.cargosOrganizados = {
                patentes: {},
                clas: {},
                elementos: {},
                maestrias: {},
                doujutsus: {},
                kekkeigenkai: {},
                outros: {}
            };

            const nomesDoujutsu = ['Byakugan', 'Tenseigan', 'Kokugan', 'Jougan', 'Rinnegan', 'Sharingan', 'Senrigan', 'Implantado'];

            await message.guild.roles.fetch();

            message.guild.roles.cache.forEach(cargo => {
                const nome = cargo.name;
                if (nome === '@everyone') return;

                const chaveLimpa = nome
                    .normalize('NFD').replace(/[\u0300-\u036f]/g, "") 
                    .replace(/[^a-zA-Z0-9]/g, ''); 

                // Separação por regras
                if (listaPatentes.some(p => nome.toLowerCase() === p.toLowerCase())) {
                    config.cargosOrganizados.patentes[chaveLimpa] = cargo.id;
                }
                else if (nome.includes('Clã') || nome.includes('Família') || nome.includes('Linhagem')) {
                    config.cargosOrganizados.clas[chaveLimpa] = cargo.id;
                } 
                else if (nome.includes('Katon') || nome.includes('Suiton') || nome.includes('Fuuton') || nome.includes('Doton') || nome.includes('Raiton')) {
                    config.cargosOrganizados.elementos[chaveLimpa] = cargo.id;
                }
                else if (nome.includes('Maestria')) {
                    config.cargosOrganizados.maestrias[chaveLimpa] = cargo.id;
                }
                else if (nomesDoujutsu.some(d => nome.includes(d))) {
                    config.cargosOrganizados.doujutsus[chaveLimpa] = cargo.id;
                }
                else if (nome.includes('Estilo')) {
                    config.cargosOrganizados.kekkeigenkai[chaveLimpa] = cargo.id;
                }
                else {
                    config.cargosOrganizados.outros[chaveLimpa] = cargo.id;
                }
            });

            // Adiciona a ID da patente Estudante na área de atalhos rápidos por segurança
            const idEstudante = message.guild.roles.cache.find(r => r.name.toLowerCase() === 'estudante')?.id;
            if (idEstudante) {
                if (!config.cargos) config.cargos = {};
                config.cargos.estudante = idEstudante;
            }

            fs.writeFileSync(caminhoConfig, JSON.stringify(config, null, 2));
            message.channel.send('✅ **Configuração Mestre concluída!** Todos os cargos de patentes foram adicionados e catalogados.');

        } catch (erro) {
            console.error(erro);
            message.channel.send('❌ Erro ao catalogar os novos cargos no arquivo JSON.');
        }
    }
};