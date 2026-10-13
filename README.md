
# Gestor Financeiro

Aplicativo web para controlar o dinheiro pessoal, sem criar conta e sem instalar nada. Feito com HTML, CSS e JavaScript puro, como projeto de estudo e portfólio.

**Demonstração:** _(coloque aqui o link do GitHub Pages depois de publicar)_

![Captura de tela do Gestor Financeiro](assets/screenshot.png)

## Funcionalidades

- **Resumo financeiro:** saldo atual, total de receitas e total de despesas, atualizados automaticamente.
- **Lançamentos:** cadastro de receitas e despesas com descrição, valor, categoria e data, além de exclusão.
- **Categorias:** alimentação, transporte, estudos, lazer, salário/renda e outros.
- **Metas de economia:** define um objetivo, guarda valores aos poucos e mostra o progresso e quanto falta.
- **Salvamento automático:** os dados ficam no `localStorage` e continuam lá depois de fechar a página.
- **Responsivo:** funciona no computador e no celular.

## Tecnologias

| Tecnologia | Uso no projeto |
|---|---|
| HTML5 | Estrutura dos formulários, cards e listas |
| CSS3 | Layout responsivo (Grid), cores e barra de progresso |
| JavaScript | Lógica financeira, eventos e atualização da interface |
| DOM | Criar, listar e remover lançamentos e metas |
| localStorage | Salvar e recuperar os dados no navegador |
| Git e GitHub | Versionamento e publicação |

## Como executar

Não precisa instalar nada.

1. Baixe ou clone o repositório:
```bash
   git clone https://github.com/SEU-USUARIO/gestor-financeiro.git
```
2. Abra a pasta no VS Code.
3. Abra o `index.html` no navegador (ou use a extensão Live Server).

## Estrutura do projeto

```
gestor-financeiro/
├── index.html
├── css/
│   └── style.css
├── js/
│   └── script.js
├── assets/
├── README.md
└── .gitignore
```

## Limitações

Os dados ficam armazenados apenas no navegador de quem usa. Isso significa que:

- não há sincronização entre dispositivos;
- limpar os dados do navegador apaga os lançamentos e as metas;
- não substitui um banco de dados real.

## Possíveis melhorias

- Filtrar lançamentos por mês e por categoria
- Gráfico de gastos por categoria
- Exportar e importar dados em arquivo
- Editar lançamentos já cadastrados
- Descontar do saldo o valor guardado nas metas

## Autor

Feito por Matheus como projeto de estudo.