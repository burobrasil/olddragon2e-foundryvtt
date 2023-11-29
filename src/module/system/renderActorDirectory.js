import { showCharacterImporter } from '../dialogs/characterImporter';

/**
 * @param {Application} app
 * @param {jQuery} html
 */
export const renderActorDirectory = (app, html) => {
  if (game.user.can('ACTOR_CREATE')) {
    const section = document.createElement('header');
    section.classList.add('character-generator');
    section.classList.add('directory-header');

    const dirHeader = html[0].querySelector('.directory-header');
    dirHeader.parentNode.insertBefore(section, dirHeader);
    section.insertAdjacentHTML(
      'afterbegin',
      `
      <div class="header-actions action-buttons flexrow">
        <button class="import-character-button"><i class="fas fa-file-import"></i>Importar Personagem</button>
      </div>
      `,
    );
    section.querySelector('.import-character-button').addEventListener('click', () => {
      showCharacterImporter();
    });
  }
};
