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
    const url = document.querySelector('#character-importer-url-text').value;
    const parsedURL = this._parseURL(url);
    const json = await this._retrieveJson(parsedURL);

    console.debug('olddragon2e | _onCharacterImporter', json);
    if (json === '') return;

    try {
      const actor = await importActor(json);
      actor.sheet.render(true);

      await this.close();
    } catch (err) {
      console.error(err);
      ui.notifications.error(`Error importing character. Check console for error log.`);
    }
  }

  _parseURL(url) {
    // check if URL ends with .json. if not, append it
    if (!url.endsWith('.json')) {
      url += '.json';
    }

    return url;
  }
  async _retrieveJson(url) {
    try {
      console.debug('olddragon2e | Retrieving JSON from URL: ', url);

      const response = await fetch(url);

      return response.json();
    } catch (error) {
      console.error(error);
      ui.notifications.error(`Error making external request. Check console for error log.`);
    }
  }
}

export const showCharacterImporter = () => {
  const characterImporterDialog = new CharacterImporterDialog();
  characterImporterDialog.render(true);
};
