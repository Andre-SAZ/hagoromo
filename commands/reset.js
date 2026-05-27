const fs = require('fs');
const banco = require('../banco.js');

module.exports = {
    nome: '!reset',

    async executar(message) {
        const args = message.content.trim().split(/ +/);
        const perfis = banco.ler();
        const idUsuario = message.author.id;
        const dados = perfis[idUsuario];

        if (!dados) {
            return message.reply('❌ Você não tem um perfil ativo para resetar.');
        }

        if (args[1] !== 'confirmar') {
            return message.reply('⚠️ **Atenção!** Isso vai apagar sua ficha, jutsus, ryōs e **remover todos os seus cargos ninjas**. Se tem certeza absoluta, digite: `!reset confirmar`');
        }

        await message.reply('🔄 Iniciando o reset completo da sua conta... Limpando histórico e removendo cargos.');

        try {
            let cargosParaRemover = [];

            // Camada 1: Lendo o config.json direto do arquivo (ignora o cache do require)
            const caminhoConfig = './config.json';
            if (fs.existsSync(caminhoConfig)) {
                const config = JSON.parse(fs.readFileSync(caminhoConfig, 'utf-8'));
                const gavetas = config.cargosOrganizados || {};

                for (const categoria in gavetas) {
                    for (const chave in gavetas[categoria]) {
                        const idCargo = gavetas[categoria][chave];
                        if (message.member.roles.cache.has(idCargo)) {
                            cargosParaRemover.push(idCargo);
                        }
                    }
                }
            }

            // Camada 2: Busca direta pelo nome do clã salvo na ficha do jogador
            if (dados.cla) {
                const cargoClaPorNome = message.guild.roles.cache.find(r => r.name.toLowerCase() === dados.cla.toLowerCase());
                if (cargoClaPorNome && !cargosParaRemover.includes(cargoClaPorNome.id)) {
                    cargosParaRemover.push(cargoClaPorNome.id);
                }
            }

            // Camada 3: Varredura de segurança nos cargos atuais do membro por palavras-chave
            message.member.roles.cache.forEach(cargo => {
                const nome = cargo.name;
                if (nome.includes('Clã') || nome.includes('Família') || nome.includes('Linhagem')) {
                    if (!cargosParaRemover.includes(cargo.id)) {
                        cargosParaRemover.push(cargo.id);
                    }
                }
            });

            // Remove todos os cargos encontrados de uma vez só
            if (cargosParaRemover.length > 0) {
                await message.member.roles.remove(cargosParaRemover);
            }

            // Apaga a ficha do banco de dados apenas após usar as informações necessárias
            delete perfis[idUsuario];
            banco.salvar(perfis);

            message.channel.send('✅ **Reset total concluído!** Sua ficha foi eliminada e todos os seus cargos (incluindo o de Clã) foram completamente removidos do seu utilizador.');

        } catch (erro) {
            console.error('Erro durante o reset:', erro);
            message.channel.send('⚠️ A sua ficha foi apagada, mas ocorreu uma falha ao tentar remover todos os cargos do Discord automaticamente.');
        }
    }
};