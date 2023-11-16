export default class OD2MonsterSheet extends ActorSheet {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      template: 'systems/olddragon2e/templates/sheets/monster-sheet.hbs',
      classes: ['olddragon2e', 'sheet', 'monster'],
      width: 820,
      height: 780,
      tabs: [{ navSelector: '.tabs', contentSelector: '.section', initial: 'skills' }],
    });
  }

  getData() {
    const baseData = super.getData();
    let sheetData = {
      owner: this.actor.isOwner,
      editable: this.isEditable,
      actor: baseData.actor,
      system: baseData.actor.system,
      config: CONFIG.olddragon2e,
    };

    return sheetData;
  }

  activateListeners(html) {
    // Owner-only Listeners
    if (this.actor.isOwner) {
      html.find('.jp-check').click(this._onJPCheck.bind(this));
      html.find('.mo-check').click(this._onMOCheck.bind(this));
    }

    super.activateListeners(html);
  }

  // Teste de JP | Jogada de Proteção
  _onJPCheck(event) {
    event.preventDefault();
    const monsterName = this.actor.name;
    let jpLabel = 'Jogada de Proteção';
    let jpValue = this.actor.system.jp;

    new Dialog({
      title: `Teste de Jogada de Proteção`,
      content: `
                <div class="form-group">
                    <label>Fórmula</label>
                    <input type="text" name="formula" value="1d20" disabled>
                </div>
                <div class="form-group">
                    <label>Ajuste de Jogada de Proteção</em></label>
                    <select name="adjustment" id="adjustment">
                        <option value="none" selected>Nenhum</option>
                        <option value="easy">Fácil (F)</option>
                        <option value="very-easy">Muito Fácil (MF)</option>
                        <option value="hard">Difícil (D)</option>
                        <option value="very-hard">Muito Difícil (MD)</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Mod. Opcional <em>(valor ou dados)</em></label>
                    <input type="text" name="bonus" id="bonus" value="" placeholder="Ex.: -1, 10, 2d4, 1d6 + 1d8 + 1d10">
                </div>
                <div class="form-group">
                    <label>Modo de Rolagem</label>
                    <select name="rollMode" id="rollMode">
                        <option value="public" selected>Public Roll</option>
                        <option value="private">Private GM Roll</option>
                        <option value="blind">Blind GM Roll</option>
                        <option value="self">Self Roll</option>
                    </select>
                </div>
            `,
      buttons: {
        roll: {
          icon: "<i class='fa-solid fa-dice-d20'></i>",
          label: 'Rolar',
          callback: async (html) => {
            let adjustment = html.find('#adjustment').val();
            const bonus = html.find('#bonus').val();
            const mode = html.find('#rollMode').val();
            let rollFormula = '1d20';

            if (adjustment !== 'none') {
              switch (adjustment) {
                case 'easy':
                  jpLabel += ' (F)';
                  jpValue += 2;
                  break;
                case 'very-easy':
                  jpLabel += ' (MF)';
                  jpValue += 5;
                  break;
                case 'hard':
                  jpLabel += ' (D)';
                  jpValue += -2;
                  break;
                case 'very-hard':
                  jpLabel += ' (MD)';
                  jpValue += -5;
                  break;
              }
            }

            if (bonus) {
              rollFormula += `+${bonus}`;
            }

            const rollResult = await new Roll(rollFormula).roll({ async: true });
            const success = rollResult.total <= jpValue;

            switch (mode) {
              case 'private':
                rollResult.toMessage(
                  {
                    flavor: `<h2 class='text-center'>Teste de <strong>${jpLabel}</strong><br>${
                      success
                        ? "<strong style='color:#18520b;'>SUCESSO!</strong>"
                        : "<strong style='color:#aa0200;'>FALHA</strong>"
                    }<h2>`,
                    speaker: { alias: `${this.truncateString(monsterName, 30)}` },
                    whisper: [game.user],
                  },
                  { rollMode: CONST.DICE_ROLL_MODES.PRIVATE },
                );
                break;
              case 'blind':
                rollResult.toMessage(
                  {
                    flavor: `<h2 class='text-center'>Teste de <strong>${jpLabel}</strong><br>${
                      success
                        ? "<strong style='color:#18520b;'>SUCESSO!</strong>"
                        : "<strong style='color:#aa0200;'>FALHA</strong>"
                    }<h2>`,
                    speaker: { alias: `${this.truncateString(monsterName, 30)}` },
                    whisper: [game.user],
                  },
                  { rollMode: CONST.DICE_ROLL_MODES.BLIND },
                );
                break;
              case 'self':
                rollResult.toMessage(
                  {
                    flavor: `<h2 class='text-center'>Teste de <strong>${jpLabel}</strong><br>${
                      success
                        ? "<strong style='color:#18520b;'>SUCESSO!</strong>"
                        : "<strong style='color:#aa0200;'>FALHA</strong>"
                    }<h2>`,
                    speaker: { alias: `${this.truncateString(monsterName, 30)}` },
                    whisper: [game.user],
                  },
                  { rollMode: CONST.DICE_ROLL_MODES.SELF },
                );
                break;
              case 'public':
              default:
                rollResult.toMessage(
                  {
                    flavor: `<h2 class='text-center'>Teste de <strong>${jpLabel}</strong><br>${
                      success
                        ? "<strong style='color:#18520b;'>SUCESSO!</strong>"
                        : "<strong style='color:#aa0200;'>FALHA</strong>"
                    }<h2>`,
                    speaker: { alias: `${this.truncateString(monsterName, 30)}` },
                    whisper: [game.user],
                  },
                  { rollMode: CONST.DICE_ROLL_MODES.PUBLIC },
                );
                break;
            }
          },
        },
        cancel: {
          icon: "<i class='fa-solid fa-xmark'></i>",
          label: 'Cancelar',
        },
      },
      default: 'roll',
    }).render(true);
  }

  // Teste de MO | Moral
  _onMOCheck(event) {
    event.preventDefault();
    const monsterName = this.actor.name;
    let moLabel = 'Moral';
    let moValue = this.actor.system.mo;

    new Dialog({
      title: `Teste de Moral`,
      content: `
                <div class="form-group">
                    <label>Fórmula</label>
                    <input type="text" name="formula" value="1d20" disabled>
                </div>
                <div class="form-group">
                    <label>Ajuste de Moral</em></label>
                    <select name="adjustment" id="adjustment">
                        <option value="none" selected>Nenhum</option>
                        <option value="easy">Fácil (F)</option>
                        <option value="very-easy">Muito Fácil (MF)</option>
                        <option value="hard">Difícil (D)</option>
                        <option value="very-hard">Muito Difícil (MD)</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Mod. Opcional <em>(valor ou dados)</em></label>
                    <input type="text" name="bonus" id="bonus" value="" placeholder="Ex.: -1, 10, 2d4, 1d6 + 1d8 + 1d10">
                </div>
                <div class="form-group">
                    <label>Modo de Rolagem</label>
                    <select name="rollMode" id="rollMode">
                        <option value="public" selected>Public Roll</option>
                        <option value="private">Private GM Roll</option>
                        <option value="blind">Blind GM Roll</option>
                        <option value="self">Self Roll</option>
                    </select>
                </div>
            `,
      buttons: {
        roll: {
          icon: "<i class='fa-solid fa-dice-d20'></i>",
          label: 'Rolar',
          callback: async (html) => {
            let adjustment = html.find('#adjustment').val();
            const bonus = html.find('#bonus').val();
            const mode = html.find('#rollMode').val();
            let rollFormula = '1d20';

            if (adjustment !== 'none') {
              switch (adjustment) {
                case 'easy':
                  moLabel += ' (F)';
                  moValue += 2;
                  break;
                case 'very-easy':
                  moLabel += ' (MF)';
                  moValue += 5;
                  break;
                case 'hard':
                  moLabel += ' (D)';
                  moValue += -2;
                  break;
                case 'very-hard':
                  moLabel += ' (MD)';
                  moValue += -5;
                  break;
              }
            }

            if (bonus) {
              rollFormula += `+${bonus}`;
            }

            const rollResult = await new Roll(rollFormula).roll({ async: true });
            const success = rollResult.total <= moValue;

            switch (mode) {
              case 'private':
                rollResult.toMessage(
                  {
                    flavor: `<h2 class='text-center'>Teste de <strong>${moLabel}</strong><br>${
                      success
                        ? "<strong style='color:#18520b;'>SUCESSO!</strong>"
                        : "<strong style='color:#aa0200;'>FALHA</strong>"
                    }<h2>`,
                    speaker: { alias: `${this.truncateString(monsterName, 30)}` },
                    whisper: [game.user],
                  },
                  { rollMode: CONST.DICE_ROLL_MODES.PRIVATE },
                );
                break;
              case 'blind':
                rollResult.toMessage(
                  {
                    flavor: `<h2 class='text-center'>Teste de <strong>${moLabel}</strong><br>${
                      success
                        ? "<strong style='color:#18520b;'>SUCESSO!</strong>"
                        : "<strong style='color:#aa0200;'>FALHA</strong>"
                    }<h2>`,
                    speaker: { alias: `${this.truncateString(monsterName, 30)}` },
                    whisper: [game.user],
                  },
                  { rollMode: CONST.DICE_ROLL_MODES.BLIND },
                );
                break;
              case 'self':
                rollResult.toMessage(
                  {
                    flavor: `<h2 class='text-center'>Teste de <strong>${moLabel}</strong><br>${
                      success
                        ? "<strong style='color:#18520b;'>SUCESSO!</strong>"
                        : "<strong style='color:#aa0200;'>FALHA</strong>"
                    }<h2>`,
                    speaker: { alias: `${this.truncateString(monsterName, 30)}` },
                    whisper: [game.user],
                  },
                  { rollMode: CONST.DICE_ROLL_MODES.SELF },
                );
                break;
              case 'public':
              default:
                rollResult.toMessage(
                  {
                    flavor: `<h2 class='text-center'>Teste de <strong>${moLabel}</strong><br>${
                      success
                        ? "<strong style='color:#18520b;'>SUCESSO!</strong>"
                        : "<strong style='color:#aa0200;'>FALHA</strong>"
                    }<h2>`,
                    speaker: { alias: `${this.truncateString(monsterName, 30)}` },
                    whisper: [game.user],
                  },
                  { rollMode: CONST.DICE_ROLL_MODES.PUBLIC },
                );
                break;
            }
          },
        },
        cancel: {
          icon: "<i class='fa-solid fa-xmark'></i>",
          label: 'Cancelar',
        },
      },
      default: 'roll',
    }).render(true);
  }

  truncateString(string, number) {
    // If the length of string is <= to number just return string don't truncate it.
    if (string.length <= number) {
      return string;
    }
    // Return string truncated with '...' concatenated to the end of string.
    return string.slice(0, number) + '...';
  }
}
