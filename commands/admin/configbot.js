const { PermissionsBitField } = require('discord.js');
const fs = require('fs');
const dadosRPG = require('../../dadosRPG.js');

module.exports = {
    nome: '!configbot',
    description: 'Sincronizador de IDs de Cargos no JSON',
    
    async executar(message) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply("❌ Apenas administradores podem usar o Arquivista.");
        }

        const msgStatus = await message.channel.send("📁 **O Arquivista começou a catalogar...** Lendo cargos do servidor e sincronizando banco de dados.");

        const cargosServidor = await message.guild.roles.fetch();
        const caminhoConfig = './config.json';
        
        let db = { cores: {}, emojis: {} };
        if (fs.existsSync(caminhoConfig)) {
            try { db = JSON.parse(fs.readFileSync(caminhoConfig, 'utf-8')); } catch (e) {}
        }
        
        // Zera e recria as gavetas com a formatação exata que o !novo precisa
        db.cargosOrganizados = {
            patentes: {},
            clas: {},
            elementos: {},
            maestrias: {},
            doujutsus: {},      // Escrito com U
            kekkeigenkai: {},   // Tudo minúsculo
            estilosLuta: {}     // Gaveta extra necessária
        };

        const mapaCategorias = {
            'elementos': 'elementos', 'patentes': 'patentes', 'clas': 'clas',
            'maestrias': 'maestrias', 'kekkeiGenkai': 'kekkeigenkai', 'dojutsus': 'doujutsus'
        };

        cargosServidor.forEach(cargo => {
            const nomeCargo = cargo.name.toLowerCase();

            // Sincroniza os itens do dadosRPG
            for (const [chaveRPG, categoriaDados] of Object.entries(dadosRPG)) {
                for (const item of categoriaDados.itens) {
                    if (nomeCargo.includes(item.nome.toLowerCase())) {
                        const gaveta = mapaCategorias[chaveRPG];
                        let chaveFormatada;

                        // Aplica a mesma lógica de texto (Regex) que existe dentro do comando !novo
                        if (gaveta === 'doujutsus' || gaveta === 'kekkeigenkai') {
                            chaveFormatada = item.nome.split(' (')[0].normalize('NFD').replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9]/g, '');
                        } else if (gaveta === 'maestrias') {
                            chaveFormatada = item.nome.replace(/\s+/g, '');
                        } else {
                            chaveFormatada = item.nome.toLowerCase().replace(/\s+/g, '_');
                        }
                        
                        db.cargosOrganizados[gaveta][chaveFormatada] = cargo.id;
                    }
                }
            }

            // Sincroniza os Estilos de Luta separadamente
            const estilos = ["Punho Suave (Jūken)", "Punho Forte (Gōken)", "Técnica de Marionetes", "Nintaijutsu", "Acrobata (Akurobatto)"];
            for (const estilo of estilos) {
                if (nomeCargo.includes(estilo.toLowerCase().split(' (')[0])) {
                    const chaveEstilo = estilo.normalize('NFD').replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9]/g, '');
                    db.cargosOrganizados.estilosLuta[chaveEstilo] = cargo.id;
                }
            }
        });

        fs.writeFileSync(caminhoConfig, JSON.stringify(db, null, 4));

        msgStatus.edit("✅ **Relatório do Arquivista:**\nTodos os cargos do Discord foram varridos e vinculados com sucesso. O arquivo `config.json` foi atualizado com os IDs e o comando `!novo` já deve estar funcionando perfeitamente!");
    }
};