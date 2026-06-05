const fs = require('fs');
const caminhoBanco = './perfis.json'; // Ajuste o caminho se o seu arquivo perfis.json estiver em outra pasta

module.exports = {
    ler: () => {
        // Verifica se o arquivo existe. Se não existir, cria um vazio para não travar o bot
        if (!fs.existsSync(caminhoBanco)) {
            fs.writeFileSync(caminhoBanco, JSON.stringify({}, null, 2));
        }
        
        // O segredo está aqui: fs.readFileSync ignora o cache do Node e lê o arquivo físico atualizado
        const dadosBrutos = fs.readFileSync(caminhoBanco, 'utf-8');
        return JSON.parse(dadosBrutos);
    },

    salvar: (dados) => {
        // Salva as alterações no arquivo de forma legível (com tabulação de 2 espaços)
        fs.writeFileSync(caminhoBanco, JSON.stringify(dados, null, 2));
    }
};