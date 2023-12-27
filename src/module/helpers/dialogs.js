/**
 * Shows a dialog with the provided options.
 *
 * @param {Object} options - The options for the dialog.
 * @param {string} options.title - The title of the dialog.
 * @param {string} options.content - The content of the dialog. If it ends with '.hbs', it will be treated as a Handlebars template.
 * @param {Object} options.data - The data to be passed to the Handlebars template.
 * @param {Object} options.buttons - An object mapping button keys to their properties.
 * @param {string} options.buttons.icon - The icon for the button.
 * @param {string} options.buttons.label - The label for the button.
 * @param {Function} options.buttons.callback - The callback function to execute when the button is clicked.
 * @param {Function} options.render - Whether to render the dialog immediately.
 *
 * @returns {Promise<void>} A promise that resolves when the dialog is rendered.
 */

export async function showDialog(options) {
  const { title, content, buttons } = options;

  let _content = content;

  if (content.endsWith('.hbs')) {
    _content = await renderTemplate(content, options.data);
  }

  const _buttons = {};

  for (const [key, value] of Object.entries(buttons)) {
    _buttons[key] = {
      icon: value.icon,
      label: value.label,
      callback: value.callback,
    };
  }

  const renderCallback = options.render ? options.render : () => {};

  new Dialog({
    title,
    content: _content,
    buttons: {
      ..._buttons,
      cancel: {
        icon: "<i class='fa-solid fa-xmark'></i>",
        label: 'Cancelar',
      },
    },
    render: renderCallback,
  }).render(true);
}
