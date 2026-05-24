const fs = require('fs');

module.exports = {
    // Função para ler o arquivo de forma segura
    ler: function() {
        try {
            const dados = fs.readFileSync('./perfis.json', 'utf-8');
            return JSON.parse(dados);
        } catch (erro) {
            console.log('Erro ao ler o banco de dados. Criando um novo vazio.');
            return {};
        }
    },

    // Função para salvar o arquivo de forma segura
    salvar: function(dados) {
        try {
            fs.writeFileSync('./perfis.json', JSON.stringify(dados, null, 2));
        } catch (erro) {
            console.log('Erro ao salvar no banco de dados:', erro);
        }
    }
};