# Gestor Financeiro

Aplicativo para controlar o dinheiro em dupla: duas pessoas entram no mesmo perfil e veem os mesmos lançamentos e metas, em tempo real, cada uma no seu aparelho. Feito com HTML, CSS e JavaScript puro, com Firebase (login e banco de dados na nuvem), como projeto de estudo e portfólio.

**Demonstração:** [potiflux-cloud.github.io/gestor-financeiro](https://potiflux-cloud.github.io/gestor-financeiro/)

![Captura de tela do Gestor Financeiro](assets/screenshot.png)

## Funcionalidades

- **Conta com e-mail e senha:** cada pessoa tem o próprio acesso, com recuperação de senha por e-mail.
- **Perfil compartilhado:** uma pessoa cria o perfil e recebe um código de convite de 8 caracteres; a outra entra com o código. Cada perfil aceita no máximo 2 pessoas.
- **Sincronização em tempo real:** o que um lança aparece na hora no outro aparelho.
- **Funciona offline:** dá para lançar sem internet; os dados sincronizam quando a conexão volta.
- **Resumo financeiro:** saldo atual, total de receitas e total de despesas, atualizados automaticamente.
- **Lançamentos:** cadastro de receitas e despesas com descrição, valor, categoria e data, além de exclusão.
- **Categorias:** alimentação, transporte, estudos, lazer, salário/renda e outros.
- **Metas de economia:** define um objetivo, guarda valores aos poucos e mostra o progresso e quanto falta. Depósitos simultâneos dos dois usuários se somam, sem sobrescrever.
- **Importação de dados antigos:** quem usava a versão anterior (`localStorage`) pode importar os dados para o perfil.
- **Responsivo:** funciona no computador e no celular.

## Como funciona

1. Cada pessoa cria uma conta.
2. A primeira cria um perfil (ex.: "Finanças da casa") e copia o código de convite exibido no topo.
3. A segunda cria a própria conta e entra no perfil com o código.
4. Os dois passam a ler e gravar nos mesmos lançamentos e metas.

## Tecnologias

| Tecnologia | Uso no projeto |
|---|---|
| HTML5 | Estrutura das telas, formulários, cards e listas |
| CSS3 | Layout responsivo (Grid), cores e barra de progresso |
| JavaScript (módulos ES) | Lógica financeira, eventos e atualização da interface |
| Firebase Authentication | Login e cadastro com e-mail e senha |
| Cloud Firestore | Banco de dados em tempo real, com cache offline |
| Regras de segurança do Firestore | Só membros do perfil leem e gravam; validação dos campos |
| Git e GitHub | Versionamento e publicação (GitHub Pages) |

## Como executar

Os módulos JavaScript não funcionam abrindo o `index.html` com duplo clique. Use um servidor local, como a extensão **Live Server** do VS Code.

1. Clone o repositório:

```bash
git clone https://github.com/potiflux-cloud/gestor-financeiro.git
```

2. Crie o seu projeto em [console.firebase.google.com](https://console.firebase.google.com):
   - **Authentication → Sign-in method:** ative **E-mail/senha**.
   - **Firestore Database:** crie o banco em modo de produção (região `southamerica-east1`).
   - **Firestore Database → Regras:** cole o conteúdo de `firestore.rules` e publique.
   - **Configurações do projeto → Seus apps:** registre um app Web e copie o `firebaseConfig`.
3. Cole o `firebaseConfig` em `js/firebase-config.js`.
4. Abra a pasta no VS Code e rode o projeto com o Live Server.
5. Se for publicar em outro endereço, adicione o domínio em **Authentication → Configurações → Domínios autorizados**.

> A chave do `firebaseConfig` não é um segredo: ela só identifica o projeto. Quem protege os dados são as regras do Firestore.

## Estrutura do projeto

```
gestor-financeiro/
├── index.html
├── firestore.rules          # regras de segurança do banco
├── css/
│   └── style.css
├── js/
│   ├── firebase-config.js   # configuração do projeto Firebase
│   ├── firebase.js          # inicialização (auth + Firestore com cache offline)
│   ├── auth.js              # login, cadastro, sair, recuperar senha
│   ├── perfil.js            # criar perfil e entrar com código de convite
│   ├── data.js              # leitura e escrita de lançamentos e metas
│   └── script.js            # interface
├── assets/
├── README.md
└── .gitignore
```

## Modelo de dados

```
usuarios/{uid}                      → { perfilId }
perfis/{perfilId}                   → { nome, membros: [uid, uid], codigo }
perfis/{perfilId}/lancamentos/{id}  → { tipo, descricao, valor, data, categoria }
perfis/{perfilId}/metas/{id}        → { nome, alvo, guardado }
convites/{codigo}                   → { perfilId, criadoPor }
```

## Limitações

- Quem tem o código de convite entra no perfil enquanto houver vaga; não compartilhe o código em lugares públicos.
- Ainda não há botão para remover alguém do perfil nem para gerar um código novo (isso é feito direto no Firebase Console).
- Cada conta fica ligada a um único perfil.
- Os valores são guardados em reais com centavos (números decimais); para um sistema financeiro de verdade, o ideal é guardar em centavos inteiros.

## Próximos passos

- Empacotar como aplicativo Android (APK) com Capacitor
- Filtrar lançamentos por mês e por categoria
- Gráfico de gastos por categoria
- Editar lançamentos já cadastrados
- Descontar do saldo o valor guardado nas metas
- Exportar dados em arquivo
- Gerenciar membros e gerar novo código de convite

## Autor

Feito por Matheus como projeto de estudo.