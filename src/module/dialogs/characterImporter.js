import { importActor } from '../api/characterImporter';

class CharacterImporterDialog extends Application {
  constructor(options = {}) {
    super(options);
  }

  /** @override */
  static get defaultOptions() {
    const options = super.defaultOptions;
    options.id = 'character-importer-dialog';
    options.title = 'Importar Personagem';
    options.template = 'systems/olddragon2e/templates/dialog/character-importer-dialog.hbs';
    options.width = 420;
    options.height = 'auto';
    return options;
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);
    html.find('.cancel-button').on('click', this._onCancel.bind(this));
    html.find('.character-importer-button').on('click', this._onCharacterImporter.bind(this));
  }

  async _onCancel(event) {
    event.preventDefault();
    await this.close();
  }

  async _onCharacterImporter(event) {
    event.preventDefault();
    const json = document.querySelector('#character-importer-textarea').value;

    if (json === '') return;

    try {
      const actor = await importActor(JSON.parse(json));
      actor.sheet.render(true);

      await this.close();
    } catch (err) {
      console.error(err);
      ui.notifications.error(`Error importing character. Check console for error log.`);
    }
  }
}

export const showCharacterImporter = () => {
  const characterImporterDialog = new CharacterImporterDialog();
  characterImporterDialog.render(true);
};
