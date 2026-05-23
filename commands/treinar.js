// Arquivo: commands/treinar.js
const fs = require('fs');

module.exports = {
    nome: '!treinar',

    executar(message) {
        // 1. Lê o arquivo de perfis
        const dadosArquivo = fs.readFileSync('./perfis.json', 'utf-8');
        const perfis = JSON.parse(dadosArquivo);
        const idUsuario = message.author.id;

        // 2. Verifica se a pessoa tem um perfil criado
        if (!perfis[idUsuario]) {
            return message.reply('Você precisa criar um perfil primeiro usando `!criarperfil`.');
        }

        // 3. Sorteia um número de 1 a 3 para escolher o que vai subir
        // Math.random() gera um número quebrado, Math.floor arredonda para baixo
        const sorteio = Math.floor(Math.random() * 3) + 1;
        let atributoGanho = '';

        // 4. Aumenta o atributo sorteado em +1
        if (sorteio === 1) {
            perfis[idUsuario].forca += 1;
            atributoGanho = '💪 Força';
        } else if (sorteio === 2) {
            perfis[idUsuario].agilidade += 1;
            atributoGanho = '🏃 Agilidade';
        } else if (sorteio === 3) {
            perfis[idUsuario].defesa += 1;
            atributoGanho = '🛡️ Defesa';
        }

        // 5. Salva a mudança de volta no arquivo
        fs.writeFileSync('./perfis.json', JSON.stringify(perfis, null, 2));

        // 6. Responde no chat
        message.reply(`O treino foi pesado! Você ganhou **+1 em ${atributoGanho}**!`);
    }
};