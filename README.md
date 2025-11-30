# transparent-HTTP-HTTPS-proxy
Proxy HTTP/HTTPS leve em Node.js com suporte a HTTP direto, túnel HTTPS via CONNECT, logs detalhados e compatível com curl e navegadores. Ideal para depuração, roteamento, filtros e análise de tráfego.

---

# HTTP/HTTPS Proxy em Node.js

Proxy completo com suporte a HTTP, túnel HTTPS (CONNECT) e logs detalhados

## 📌 Sobre o Projeto

Este projeto implementa um **proxy HTTP e HTTPS** utilizando Node.js, suportando:

* Requisições HTTP diretas
* Túnel HTTPS via método CONNECT
* Log detalhado de cada requisição
* Medição de tempo de resposta
* Contador de bytes transferidos
* Erros tratados e exibidos claramente
* Compatibilidade com `curl`, navegadores e softwares de rede

O proxy encaminha requisições da máquina cliente para qualquer destino remoto, funcionando como intermediário para depuração, auditoria, filtro de tráfego ou estudo de protocolos.

Código oficial do Node.js:
[https://nodejs.org](https://nodejs.org)
Documentação do módulo HTTP:
[https://nodejs.org/api/http.html](https://nodejs.org/api/http.html)

---

## 🚀 Funcionalidades

### ✔ Suporte a HTTP

* Intercepta requisições HTTP completas
* Reenvia para o servidor de destino
* Loga método, URL, bytes trafegados e tempo

### ✔ Suporte a HTTPS com CONNECT

* Abre túneis criptografados sem descriptografar dados
* Permite navegar em sites HTTPS via proxy
* Loga host, porta e tempo de conexão

### ✔ Logs em tempo real

Exemplos de saída:

```
[HTTP] GET → www.google.com/search?q=node
[HTTP RESPOSTA] www.google.com | Status: 200 | 32415 bytes | 132ms
[CONNECT] HTTPS solicitado → github.com:443
[CONNECT ENCERRADO] github.com:443 | 34224ms
```

### ✔ Tratamento de erros

* URLs inválidas
* Conexão recusada
* Servidor remoto inacessível
* Túnel HTTPS cancelado

Tudo é exibido no console com clareza.

---

## 📁 Estrutura do Código

O proxy é composto por:

* Servidor HTTP principal
* Manipulador CONNECT para HTTPS
* Logs avançados
* Contadores de tráfego
* Medição de tempo

---

## 📦 Instalação

Requisitos:

* Node.js 18+
  Download:
  [https://nodejs.org](https://nodejs.org)

Instalação:

```
npm install
```

Rodar o proxy:

```
npm start
```

O servidor será iniciado em:

```
http://localhost:8080
```

---

## 🖥 Como Usar

### Testar HTTP:

```
curl -x http://localhost:8080 http://example.com
```

### Testar HTTPS:

```
curl -x http://localhost:8080 https://google.com
```

### Usar no navegador:

Windows → Configurações → Proxy:

* Host: `localhost`
* Porta: `8080`

Todas as requisições passam pelo seu proxy.

---

## 📚 Código Completo

O projeto inclui:

* JSDoc
* `startProxy()`
* Manipulação HTTP
* Manipulação HTTPS CONNECT
* Logs avançados

---

## 📊 Possíveis Extensões (Futuras Features)

* Cache de respostas
* Sistema de bloqueio de domínios
* Painel de monitoramento em tempo real
* Limite de velocidade (Rate Limit)
* Autenticação (Proxy-Authorization)
* Conversão para proxy reverso
* MITM com certificado próprio (inspeção HTTPS)

---

## 👍 Pontos Positivos

* Leve
* Simples
* Fácil de modificar
* Excelente para estudos
* Funciona em qualquer máquina
* Sem dependências externas

## 👎 Pontos Negativos

* Não descriptografa HTTPS (by design)
* Não possui cache interno
* Não é ideal para produção sem otimizações
* Não protege contra alto volume de conexões

## 📬 Contribuições

Pull requests e sugestões são bem-vindos.
