// Memória temporária global para as lutas.
// Se o bot for reiniciado, as lutas atuais são canceladas (o que é ideal para evitar soft-locks).
const batalhasAtivas = new Map();

module.exports = batalhasAtivas;