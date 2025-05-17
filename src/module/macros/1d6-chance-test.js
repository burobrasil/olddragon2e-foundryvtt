Hooks.once('ready', async () => {
  // Apenas o GM executa a criação do macro "global"
  if (!game.user.isGM) return;

  const macroName = 'Teste de Chance em 1d6';
  // Procura um macro global pelo nome (macros globais têm folder === null)
  let macro = game.macros.find((m) => m.name === macroName && m.folder === null);

  if (!macro) {
    macro = await Macro.create({
      name: macroName,
      type: 'script',
      img: 'systems/olddragon2e/assets/icons/d6.svg',
      command: `
const content = \`
<form>
  <div class="form-group">
    <label for="chance">Chance (1 a 6):</label>
    <select id="chance" name="chance">
      <option value="1">1 em 1d6</option>
      <option value="2">2 em 1d6</option>
      <option value="3">3 em 1d6</option>
      <option value="4">4 em 1d6</option>
      <option value="5">5 em 1d6</option>
      <option value="6">6 em 1d6</option>
    </select>
  </div>
</form>
\`;

new Dialog({
  title: "Teste de Chance em 1d6",
  content,
  buttons: {
    roll: {
      icon: '<i class="fas fa-dice"></i>',
      label: "Rolar",
      callback: async html => {
        const diff = parseInt(html.find('[name="chance"]').val());
        const roll = new Roll("1d6");
        await roll.evaluate();
        await roll.toMessage({
          roll,
          speaker: ChatMessage.getSpeaker(),
          flavor: \`<div class="title">Teste de <strong>Chance de \${diff} em 1d6</strong></div>\` +
                  (roll.total <= diff
                    ? '<p class="result"><strong class="success">Sucesso!</strong></p>'
                    : '<p class="result"><strong class="failure">Falha</strong></p>')
        });
      }
    },
    cancel: {
      icon: '<i class="fas fa-times"></i>',
      label: "Cancelar"
    }
  },
  default: "roll"
}).render(true);
      `,
      ownership: { default: 1 }, // 1 = LIMITED
      flags: { olddragon2e: true },
    });
  }
});
