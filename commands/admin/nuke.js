const fs = require('fs');

module.exports = {
    nome: '!nuke',

    async executar(message) {
        // Trava 1: Apenas Administradores
        if (!message.member.permissions.has('Administrator')) {
            return message.reply('❌ Você não tem permissão para usar este comando.');
        }

        const args = message.content.trim().split(/ +/);

        // Trava 2: Palavra-chave exata (Aviso atualizado)
        if (args[1] !== 'confirmar_destruicao') {
            return message.reply('⚠️ **ALERTA VERMELHO MÁXIMO!** Este comando vai **APAGAR TODOS OS CARGOS** do Discord, zerar o banco de dados e **DELETAR TODAS AS FICHAS** dos jogadores. Não haverá volta. Se tem certeza absoluta, digite: `!nuke confirmar_destruicao`');
        }

        const msgAviso = await message.reply('☢️ **INICIANDO PROTOCOLO NUCLEAR TOTAL...** Deletando cargos e vaporizando registros shinobis. Por favor, aguarde.');

        try {
            await message.guild.roles.fetch();

            let deletados = 0;
            let falhas = 0;

            // O bot tenta deletar todos os cargos, exceto o @everyone e cargos acima dele
            for (const cargo of message.guild.roles.cache.values()) {
                if (cargo.name === '@everyone') continue;
                if (!cargo.editable) {
                    falhas++;
                    continue;
                }

                try {
                    await cargo.delete('Wipe total solicitado via comando !nuke');
                    deletados++;
                } catch (err) {
                    falhas++;
                }
            }

            // ==========================================
            // DESTRUIÇÃO DO CONFIG.JSON
            // ==========================================
            const caminhoConfig = './config.json';
            let config = { cores: {}, emojis: {}, cargos: {} };

            // Esvazia totalmente as organizações (incluindo a gaveta nova de estilosLuta)
            config.cargosOrganizados = {
                patentes: {},
                clas: {},
                elementos: {},
                maestrias: {},
                doujutsus: {},
                kekkeigenkai: {},
                estilosLuta: {} 
            };

            fs.writeFileSync(caminhoConfig, JSON.stringify(config, null, 2));

            // ==========================================
            // DESTRUIÇÃO DO PERFIS.JSON (WIPE DAS FICHAS)
            // ==========================================
            fs.writeFileSync('./perfis.json', JSON.stringify({}, null, 2));

            // Relatório Final
            await msgAviso.edit(`✅ **Wipe Total Concluído!** \n💥 **${deletados}** cargos foram pulverizados do Discord.\n🛡️ **${falhas}** cargos foram ignorados (cargos de bots ou com hierarquia superior).\n📂 O arquivo \`config.json\` foi completamente limpo.\n💀 **TODAS as fichas de jogadores (\`perfis.json\`) foram apagadas!**\n\nVocê já pode usar o \`!configsv\` para recriar o mundo do zero.`);

        } catch (erro) {
            console.error('Erro no protocolo nuclear:', erro);
            message.reply('❌ Ocorreu um erro crítico durante o nuke.');
        }
    }
};