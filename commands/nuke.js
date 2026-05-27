const fs = require('fs');

module.exports = {
    nome: '!nuke',

    async executar(message) {
        // Trava 1: Apenas Administradores
        if (!message.member.permissions.has('Administrator')) {
            return message.reply('❌ Você não tem permissão para usar este comando.');
        }

        const args = message.content.trim().split(/ +/);

        // Trava 2: Palavra-chave exata
        if (args[1] !== 'confirmar_destruicao') {
            return message.reply('⚠️ **ALERTA VERMELHO!** Este comando vai **APAGAR TODOS OS CARGOS** do Discord (abaixo do bot) e zerar o banco de dados do `config.json`. Se tem certeza absoluta, digite: `!nuke confirmar_destruicao`');
        }

        const msgAviso = await message.reply('☢️ **INICIANDO PROTOCOLO NUCLEAR...** Deletando cargos do servidor. Isso pode demorar vários segundos devido aos limites do Discord. Por favor, aguarde.');

        try {
            await message.guild.roles.fetch();

            let deletados = 0;
            let falhas = 0;

            // O bot tenta deletar todos os cargos, exceto o @everyone e cargos acima dele
            for (const cargo of message.guild.roles.cache.values()) {
                if (cargo.name === '@everyone') continue;
                if (!cargo.editable) {
                    falhas++; // Cargos de bots ou de admin acima do Hagoromo não podem ser apagados
                    continue;
                }

                try {
                    await cargo.delete('Wipe total solicitado via comando !nuke');
                    deletados++;
                } catch (err) {
                    falhas++;
                }
            }

            // Zerando as gavetas no config.json
            const caminhoConfig = './config.json';
            let config = { cores: {}, emojis: {}, cargos: {} };

            if (fs.existsSync(caminhoConfig)) {
                config = JSON.parse(fs.readFileSync(caminhoConfig, 'utf-8'));
            }

            // Esvazia totalmente as organizações
            config.cargosOrganizados = {
                patentes: {},
                clas: {},
                elementos: {},
                maestrias: {},
                doujutsus: {},
                kekkeigenkai: {},
                outros: {}
            };

            fs.writeFileSync(caminhoConfig, JSON.stringify(config, null, 2));

            await msgAviso.edit(`✅ **Wipe Concluído!** \n💥 **${deletados}** cargos foram pulverizados do Discord.\n🛡️ **${falhas}** cargos foram ignorados (cargos de bots ou com hierarquia superior).\n📂 O arquivo \`config.json\` foi completamente limpo.\n\nVocê já pode usar o \`!configsv\` para recriar o mundo do zero!`);

        } catch (erro) {
            console.error('Erro no protocolo nuclear:', erro);
            message.channel.send('❌ Ocorreu um erro crítico durante a deleção em massa.');
        }
    }
};