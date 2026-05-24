const banco = require('../banco.js');
const config = require('../config.json');

module.exports = {
    nome: '!reset',

    async executar(message) {
        const args = message.content.trim().split(/ +/);

        // Trava de segurança contra acidentes
        if (args[1] !== 'confirmar') {
            return message.reply('⚠️ **Cuidado!** Isso vai apagar sua ficha inteira, seus jutsus e seus status para sempre.\nPara continuar, digite: `!reset confirmar`');
        }

        const perfis = banco.ler();
        const idUsuario = message.author.id;

        // Verifica se a pessoa realmente tem uma ficha para apagar
        if (!perfis[idUsuario]) {
            return message.reply('❌ Você não tem nenhuma ficha criada para resetar.');
        }

        // --------------------------------------------------
        // PASSO 1: APAGAR OS DADOS DO ARQUIVO
        // --------------------------------------------------
        delete perfis[idUsuario];
        banco.salvar(perfis);

        // --------------------------------------------------
        // PASSO 2: REMOVER OS CARGOS DO DISCORD
        // --------------------------------------------------
        try {
            // Pega todos os IDs de cargos mapeados no config.json
            const idsCargos = Object.values(config.cargos);

            // Filtra apenas os cargos que o jogador possui atualmente
            const cargosParaRemover = message.member.roles.cache.filter(cargo => idsCargos.includes(cargo.id));

            // Remove todos de uma vez
            if (cargosParaRemover.size > 0) {
                await message.member.roles.remove(cargosParaRemover);
            }
        } catch (erro) {
            console.log('Erro ao remover os cargos no reset:', erro);
            message.channel.send('⚠️ Os dados foram apagados, mas houve um erro ao tirar seus cargos automaticamente. Peça para um administrador remover manualmente.');
        }

        message.reply('✅ Sua ficha foi apagada com sucesso! Todos os seus dados e cargos ninja foram removidos. Você pode começar uma nova jornada usando o comando `!novo`.');
    }
};