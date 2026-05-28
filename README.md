⛩️ Hagoromo RPG - Discord Bot
Hagoromo é uma aplicação focada em gerenciamento e automação de sistemas de RPG de texto para comunidades do Discord, inspirado no universo shinobi de Naruto. Desenvolvido do zero, o bot atua como Mestre de Jogo (Game Master), automatizando a criação de fichas, atribuição de cargos, treinamento de personagens e uso de técnicas (Jutsus).

✨ Principais Funcionalidades
🎲 Criação de Personagem Assistida (!novo): Sorteio dinâmico de clãs e distribuição automática de vantagens, atributos (Vida, Chakra) e cargos baseados no clã sorteado.

📊 Painel de Status Interativo (!status): Visualização completa da ficha do jogador, incluindo atributos físicos, genéticas (Dōjutsus, Kekkei Genkais) e maestrias divididas em páginas interativas.

🏋️ Sistema de Progressão (Treinos): Sistema de evolução via Roleplay (!treino). Jogadores enviam ações de treino que são avaliadas pela Staff via painel de botões (Aprovar/Reprovar).

⚔️ Motor de Combate e Jutsus: Banco de dados extenso e categorizado por elementos (!aprenderjutsu, !jutsu). Calcula gasto de chakra e dano de forma automatizada.

🛠️ Automação de Infraestrutura: Comandos exclusivos para Administradores que criam e sincronizam dezenas de cargos do Discord com o banco de dados interno em poucos segundos (!configsv e !configbot).

📂 Arquitetura do Projeto
O projeto utiliza arquivos JSON locais como banco de dados relacional e adota uma estrutura modular separada por escopo:

Plaintext
📦 hagoromo
 ┣ 📂 commands
 ┃ ┣ 📂 admin          # Ferramentas da Staff (configsv, configbot, nuke)
 ┃ ┣ 📂 geral          # Utilidades (ping, help, sobrenos)
 ┃ ┣ 📂 jutsus         # Aprendizado e uso de técnicas
 ┃ ┗ 📂 personagem     # Criação, status, treino e reset
 ┣ 📂 jutsus           # Banco de dados de jutsus (.json separados por elemento)
 ┣ 📜 .env             # Variáveis de ambiente (Token do bot)
 ┣ 📜 banco.js         # Módulo de leitura/escrita do perfis.json
 ┣ 📜 clas.json        # Dados, lore e vantagens dos clãs
 ┣ 📜 config.json      # Mapeamento de IDs do Discord
 ┣ 📜 dadosRPG.js      # Estrutura base de cargos e hierarquias
 ┣ 📜 index.js         # Ponto de entrada e Event Listener principal
 ┣ 📜 perfis.json      # Fichas dos jogadores (DB)
 ┗ 📜 treinos.json     # Catálogo de exercícios e recompensas
🚀 Como Instalar e Rodar Localmente
Pré-requisitos
Node.js (Versão 16.11.0 ou superior).

Um bot criado no Discord Developer Portal com as Privileged Gateway Intents (Server Members, Message Content) ativadas.

Instalação
Clone o repositório:

Bash
git clone https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git
cd hagoromo
Instale as dependências:

Bash
npm install
Crie um arquivo chamado .env na raiz do projeto e insira o token do seu bot:

Snippet de código
TOKEN_DO_BOT=cole_seu_token_aqui
Inicie a aplicação:

Bash
node index.js
⚙️ Guia de Configuração do Servidor (Setup Inicial)
Para que o bot funcione corretamente no seu servidor do Discord, siga a ordem de comandos abaixo assim que ele estiver online:

!configsv (O Pedreiro): Cria todos os cargos necessários no seu servidor (Clãs, Elementos, Patentes, Dōjutsus, etc.).

!configbot (O Arquivista): Varre os cargos recém-criados e salva os IDs deles no config.json para o bot saber quem é quem.

Pronto! Os jogadores já podem usar o !novo para criar suas fichas.

(Nota: Caso queira limpar o servidor para uma nova temporada, utilize !reset all confirmar (mantém a estrutura) ou !nuke confirmar_destruicao (apaga todos os cargos e fichas do servidor)).

🛠️ Tecnologias Utilizadas
JavaScript (Node.js): Linguagem base.

Discord.js (v14): Biblioteca para interação com a API do Discord.

Dotenv: Gerenciamento seguro de variáveis de ambiente.

JSON: Persistência de dados local leve e eficiente.

📝 Licença
Este projeto é de uso livre para estudos, modificações e hospedagem de RPGs próprios. Sinta-se à vontade para fazer forks e expandir os sistemas!
