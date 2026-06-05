const fs = require('fs');
const { EmbedBuilder } = require('discord.js');
const banco = require('./banco.js');

module.exports = (client) => {
    const caminhoTaijutsu = './jutsus/taijutsu.json';

    if (fs.existsSync(caminhoTaijutsu)) {
        const golpesFisicos = JSON.parse(fs.readFileSync(caminhoTaijutsu, 'utf-8'));

        for (const [chaveGolpe, dadosGolpe] of Object.entries(golpesFisicos)) {
            
            const comandoDinamico = {
                nome: `!${chaveGolpe}`, // Exemplo: !combo1
                async executar(message) {
                    const perfis = banco.ler();
                    const idUsuario = message.author.id;
                    const dadosJogador = perfis[idUsuario];

                    if (!dadosJogador) {
                        return message.reply('❌ Você precisa ter uma ficha para lutar. Use `!novo`.');
                    }

                    const embedAtaque = new EmbedBuilder()
                        .setColor('#E74C3C')
                        .setTitle(`👊 ${dadosGolpe.nome}`)
                        .setDescription(`**${dadosJogador.nome}** ${dadosGolpe.descricao}`)
                        .addFields(
                            { name: '💥 Dano Base', value: `${dadosGolpe.dano} HP`, inline: true },
                            { name: '🌀 Custo', value: `${dadosGolpe.custoChakra} Chakra`, inline: true }
                        )
                        .setImage(dadosGolpe.imagem);

                    await message.channel.send({ embeds: [embedAtaque] });
                }
            };
            
            // Salva o comando virtual na "mente" do bot
            client.commands.set(comandoDinamico.nome, comandoDinamico);
        }
    }
};