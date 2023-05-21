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
