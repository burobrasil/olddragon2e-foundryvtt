# Old Dragon 2a Edição para Foundry VTT

Sistema do Old Dragon 2a Edição para FoundryVTT.

**Note for English speakers & international community**: Old Dragon 2nd Edition is a Brazilian Tabletop Roleplaying Game and, at this time, is only written in Brazilian Portuguese. Because of that, the rest of this module is written primarely in Portuguese.

## Recursos disponíveis:

- Criação de Personagens, Monstros & Inimigos e Itens (Armas, Armaduras, Escudos, Itens Gerais, Recipientes & Vasilhames, Montarias & Transportes) personalizados;
- Cálculo automático de modificadores de atributos;
- Rolagens de dados para Atributos, Jogadas de Proteção, Ataques (BAC/BAD) e Dano. As rolagens incluem Ajuste de Teste e Modificador Opcional;
- Gerenciamento de Magias: Adicionar, editar, mover, remover e lançar uma magia.
- Gerenciamento de Equipamentos: Adicionar, editar, equipar, mover e remover um equipamento. Ao alterar a quantidade de um item, o Peso Total, o Valor Total e a Carga Atual do personagem são atualizados dinamicamente.

O restante da ficha deve ser preenchida e gerenciada manualmente. Mais abaixo você encontra uma lista de pendências com o que planejamos implementar no futuro.

## Instalação

Copie o link do manifesto abaixo e cole na caixa de manifesto (link manifest):

```
https://github.com/burobrasil/olddragon2e-foundryvtt/releases/latest/download/system.json
```

Opcionalmente, com o FoundryVTT fechado, você pode baixar o arquivo `olddragon2e.zip` da aba de [Releases](https://github.com/burobrasil/olddragon2e-foundryvtt/releases) e colocar dentro do seu FoundryVTT, na subpasta `Data/systems`.

## Pendências

O sistema `olddragon2e` para Foundry VTT está em desenvolvimento contínuo, ainda em versão _alpha_. Abaixo estão listadas as pendências (funcionalidades ainda não desenvolvidas) que gostaríamos de implementar. Se você tem conhecimentos técnicos, sinta-se convidado a contribuir com este sistema de código aberto.

- Cálculo automático de movimentos (Correr, Escalar, Nadar);
- Adicionar CA ao equipar equipamento com bônus de CA;
- Adicionar carga extra ao equipar Mochila;
- Controle de uso de Magias;
- Raças e Classes dinâmicas (xp, movimento, infravisão, habilidades);
- Controle de uso de Habilidades de Classe;
- Rolagem de ataque para Monstros;
- Tabelas de rolagens diversas (ex: Tesouros);
- Sistema de turnos/iniciativa (Combat Tracker).

## Development

### Prerequisites

In order to build this system, recent versions of `node` and `npm` are required. Most likely, using `yarn` also works, but only `npm` is officially supported. We recommend using the latest lts version of `node`. If you use `nvm` to manage your `node` versions, you can simply run

```
nvm install
```

in the project's root directory.

You also need to install the project's dependencies. To do so, run

```
npm install
```

### Building

You can build the project by running

```
npm run build
```

Alternatively, you can run

```
npm run build:watch
```

to watch for changes and automatically build as necessary.

### Linking the built project to Foundry VTT

In order to provide a fluent development experience, it is recommended to link the built system to your local Foundry VTT installation's data folder. In order to do so, first add a file called `foundryconfig.json` to the project root with the following content:

```
{
  "dataPath": ["/absolute/path/to/your/FoundryVTT"]
}
```

(if you are using Windows, make sure to use `\` as a path separator instead of `/`)

Then run

```
npm run link-project
```

On Windows, creating symlinks requires administrator privileges, so unfortunately you need to run the above command in an administrator terminal for it to work.

You can also link to multiple data folders by specifying multiple paths in the `dataPath` array.

### Running the tests

You can run the tests with the following command:

```
npm test
```

### Creating a release

The workflow works basically the same as the workflow of the [League Basic JS Module Template](https://github.com/League-of-Foundry-Developers/FoundryVTT-Module-Template), please follow the instructions given there.

## Licensing

This project is under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/deed.pt-br), using the [Old Dragon 2e SRD](https://olddragon.com.br/livros/srd).

This project is being developed under the terms of the [LIMITED LICENSE AGREEMENT FOR MODULE DEVELOPMENT](https://foundryvtt.com/article/license/) for Foundry Virtual Tabletop.
