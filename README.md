Como rodar o projeto:

1. Tenha o NodeJs instalado
2. Tenha o NPM instalado
3. De permissoes de execucao para o arquivo start-client.sh e start-server.sh

```bash
$ chmod +x start-client.sh
$ chmod +x start-server.sh
```

4. Execute o arquivo start-server.sh para iniciar o server

```bash
$ ./start-server.sh
```

5. Execute o arquivo start-client.sh para iniciar o client

```bash
$ ./start-client.sh
```

6. Acesse o client em http://localhost:3000

### Windows

Caso nao tenha o wsl instalado, tenha certeza de que possui no node e o npm instalados.
Execute:

Para iniciar o servidor:

```bash
  $ npm install
  $ npm run dev
```

Para iniciar o client:

```bash
  $ npm install
  $ npx serve ./client
```

Obs:

- O client e o server devem ser executados em terminais separados
- O client e o server devem ser executados na mesma maquina
- URL do server: http://localhost:3333
- URL do client: http://localhost:3000
- O server deve ser executado antes do client
- O arquivo Insominia_2023-03-24.json contem as rotas do server para serem importadas no Insomnia (concorrente do Postman) e testadas. Basta importar o arquivo no Insomnia e executar as rotas enquanto o servidor estiver executando.
- No insomniae e no código, pode-se ver uma rota chamada "Hack". Esta rota simula uma alteração no banco de dados, alterando um byte do texto criptografado. Quando um texto é alterado, se o usuário tentar descriptografar o texto, o mesmo não será descriptografado, pois o HMAC não será mais válido.
