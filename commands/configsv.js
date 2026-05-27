const { PermissionsBitField } = require('discord.js');
const dadosRPG = require('./dadosRPG.js'); // Usa ../ pois o arquivo deve estar na pasta raiz

const delay = (ms) => new Promise(res => setTimeout(res, ms));

module.exports = {
    nome: '!configsv',
    description: 'Construtor Automático de Cargos',
    
    async executar(message) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply("❌ Apenas administradores podem usar o Construtor.");
        }

        let criados = 0;
        const msgStatus = await message.channel.send("🔨 **O Construtor começou a trabalhar.** Construindo os cargos (isso leva alguns segundos para não travar o Discord)...");

        // Varre o dadosRPG e cria os cargos principais
        for (const [chaveCategoria, categoriaDados] of Object.entries(dadosRPG)) {
            for (const item of categoriaDados.itens) {
                // Se for clã, cria APENAS com o nome exato para não bugar o comando !novo
                const nomeCargo = (chaveCategoria === 'clas') ? item.nome : `${item.emoji} ${item.nome}`;
                const corFinal = item.cor || categoriaDados.corPadrao || '#99AAB5'; 

                const cargoExiste = message.guild.roles.cache.find(r => r.name === nomeCargo);

                if (!cargoExiste) {
                    try {
                        await message.guild.roles.create({
                            name: nomeCargo,
                            color: corFinal,
                            reason: 'Construção automática via Construtor (!configsv)'
                        });
                        criados++;
                        await delay(2000); // Respiro de 2 segundos
                    } catch (error) {
                        console.error(`Erro ao criar ${nomeCargo}:`, error);
                    }
                }
            }
        }

        // Criando os cargos de Estilo de Luta separadamente (pois são vitais para o !novo)
        const estilosExtras = [
            { nome: "Punho Suave (Jūken)", cor: "#FFFFFF" },
            { nome: "Punho Forte (Gōken)", cor: "#2ECC71" },
            { nome: "Técnica de Marionetes", cor: "#9B59B6" },
            { nome: "Nintaijutsu", cor: "#F1C40F" },
            { nome: "Acrobata (Akurobatto)", cor: "#E74C3C" }
        ];

        for (const estilo of estilosExtras) {
            const cargoExiste = message.guild.roles.cache.find(r => r.name === estilo.nome);
            if (!cargoExiste) {
                try {
                    await message.guild.roles.create({ name: estilo.nome, color: estilo.cor, reason: 'Estilos de Luta (!configsv)' });
                    criados++;
                    await delay(2000);
                } catch (e) {}
            }
        }

        msgStatus.edit(`✅ **Relatório do Construtor:**\nO serviço terminou! Foram construídos **${criados}** novos cargos.\nO servidor está pronto para a próxima fase. Digite \`!configbot\`.`);
    }
};