# ⛩️ Hagoromo RPG - Discord Bot

<div align="center">
  <img src="https://img.shields.io/badge/Discord.js-v14-blue?logo=discord&logoColor=white" alt="Discord.js v14" />
  <img src="https://img.shields.io/badge/Node.js-v18+-green?logo=node.js" alt="Node.js" />
  <img src="https://img.shields.io/badge/Status-Em_Desenvolvimento-orange" alt="Status" />
</div>

<br>

**Hagoromo** é uma aplicação focada em gerenciamento e automação de sistemas de RPG de texto para comunidades do Discord, inspirado no universo shinobi de Naruto. Desenvolvido do zero, o bot atua como Mestre de Jogo (Game Master), automatizando a criação de fichas, atribuição de cargos, treinamento de personagens e uso de técnicas (Jutsus).

---

## ✨ Principais Funcionalidades

* 🎲 **Criação de Personagem Assistida (`!novo`):** Sorteio dinâmico de clãs e distribuição automática de vantagens, atributos (Vida, Chakra) e cargos baseados no clã sorteado.
* 📊 **Painel de Status Interativo (`!status`):** Visualização completa da ficha do jogador, incluindo atributos físicos, genéticas (Dōjutsus, Kekkei Genkais) e maestrias divididas em páginas interativas.
* 🏋️ **Sistema de Progressão (Treinos):** Sistema de evolução via Roleplay (`!treino`). Jogadores enviam ações de treino que são avaliadas pela Staff via painel de botões integrados (Aprovar/Reprovar).
* ⚔️ **Motor de Combate e Jutsus:** Banco de dados extenso e categorizado por elementos (`!aprenderjutsu`, `!jutsu`). Calcula gasto de chakra e dano de forma automatizada.
* 🛠️ **Automação de Infraestrutura:** Comandos exclusivos para Administradores que criam e sincronizam dezenas de cargos do Discord com o banco de dados interno em poucos segundos (`!configsv` e `!configbot`).

---

## 📂 Arquitetura do Projeto

O projeto utiliza **arquivos JSON** locais como banco de dados relacional e adota uma estrutura modular moderna separada por escopo de comandos:

```text
📦 hagoromo
 ┣ 📂 commands
 ┃ ┣ 📂 admin          # Ferramentas da Staff (configsv, configbot, nuke)
 ┃ ┣ 📂 geral          # Utilidades (ping, help, sobrenos, hagoromo, naruto)
 ┃ ┣ 📂 jutsus         # Aprendizado e uso de técnicas (aprenderjutsu, jutsu, jutsus)
 ┃ ┗ 📂 personagem     # Criação e gerenciamento (novo, status, treino, reset)
 ┣ 📂 jutsus           # Banco de dados de jutsus (.json separados por elemento)
 ┣ 📜 .env             # Variáveis de ambiente (Token do bot)
 ┣ 📜 banco.js         # Módulo de leitura/escrita seguro do perfis.json
 ┣ 📜 clas.json        # Dados, lore e vantagens inatas dos clãs
 ┣ 📜 config.json      # Mapeamento dinâmico de IDs numéricos do Discord
 ┣ 📜 dadosRPG.js      # Estrutura base de cargos e hierarquias do servidor
 ┣ 📜 index.js         # Ponto de entrada, Handler de Eventos e Comandos
 ┣ 📜 perfis.json      # Fichas salvas dos jogadores (Database Principal)
 ┗ 📜 treinos.json     # Catálogo de exercícios, regras e recompensas
