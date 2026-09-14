# 🏀 Basketball Player

Jogo de arremesso de basquete em HTML5 Canvas puro — sem frameworks ou bibliotecas externas.

## Como jogar
- **← / →** — mover o jogador
- **↑ / ↓** — ajustar a força do arremesso (veja a barra "FORÇA" no canto inferior esquerdo)
- **ESPAÇO** — arremessar a bola

Você tem **60 segundos** para acertar o maior número de cestas possível. Cada cesta vale **2 pontos**.

## Arquivos
- `index.html` — estrutura da página
- `stys.css` — estilos visuais (HUD, tela de fim de jogo, responsivo)
- `script.js` — lógica do jogo (física, colisões, pontuação, partículas)

## Rodando localmente
Basta abrir o `index.html` em qualquer navegador moderno. Não há dependências nem build necessário.

## O que foi corrigido/adicionado
O `script.js` original estava incompleto (cortava no meio da configuração inicial, sem nenhuma lógica de jogo). Foi implementado:
- Movimento do jogador e ajuste de força
- Física de projétil (gravidade, arremesso com ângulo fixo e força variável)
- Colisão da bola com a tabela e quique nas bordas do aro
- Detecção de cesta ao passar pelo aro
- Indicador de mira e barra de força desenhados no canvas
- Efeito de partículas ao acertar a cesta
- Cronômetro regressivo, contador de arremessos e tela de "Fim de Jogo" com botão de reiniciar totalmente funcional
