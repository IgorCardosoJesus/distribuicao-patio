document.addEventListener('DOMContentLoaded', function() {
    // Valores iniciais
    const ciasExemplo = [
        { nome: 'EM', qtde: 3 },
        { nome: 'CCAP', qtde: 6 },
        { nome: 'servico', qtde: 9 },
        { nome: '1ª Cia', qtde: 6 },
        { nome: '2ª Cia', qtde: 3 }
    ];

    const ciasList = document.getElementById('cia-list');
    const btnAddCia = document.getElementById('add-cia');
    const btnCalcular = document.getElementById('calcular');
    const resultadoContent = document.getElementById('resultado-content');
    const visualization = document.getElementById('visualization');

    // Adicionar cias exemplo iniciais
    ciasExemplo.forEach(cia => {
        adicionarCia(cia.nome, cia.qtde);
    });

    // Evento de adicionar nova Cia
    btnAddCia.addEventListener('click', function() {
        const nome = document.getElementById('cia-nome').value.trim();
        const qtde = parseInt(document.getElementById('cia-qtde').value);

        if(nome && !isNaN(qtde) && qtde > 0) {
            adicionarCia(nome, qtde);
            document.getElementById('cia-nome').value = '';
            document.getElementById('cia-qtde').value = '';
        } else {
            alert('Por favor, insira um nome válido e uma quantidade maior que 0');
        }
    });

    // Evento de calcular
    btnCalcular.addEventListener('click', calcularDistribuicao);

    // Função para adicionar uma Cia à lista
    function adicionarCia(nome, qtde) {
        const ciaItem = document.createElement('div');
        ciaItem.className = 'cia-item';
        ciaItem.innerHTML = `
            <span class="cia-name">${nome}</span>
            <span class="cia-value">${qtde}</span>
            <button class="cia-delete">Remover</button>
        `;

        const btnDelete = ciaItem.querySelector('.cia-delete');
        btnDelete.addEventListener('click', function() {
            ciaItem.remove();
        });

        ciasList.appendChild(ciaItem);
    }

    // Função principal para calcular a distribuição
    function calcularDistribuicao() {
        // Obter tamanho do pátio
        const PATIO = parseInt(document.getElementById('patio').value);
        if(isNaN(PATIO) || PATIO <= 0) {
            alert('O tamanho do pátio deve ser um número positivo');
            return;
        }

        // Coletar cias da lista
        const cias = {};
        const ciasItens = document.querySelectorAll('.cia-item');

        if(ciasItens.length === 0) {
            alert('Adicione pelo menos uma companhia');
            return;
        }

        ciasItens.forEach(item => {
            const nome = item.querySelector('.cia-name').textContent;
            const qtde = parseInt(item.querySelector('.cia-value').textContent);
            cias[nome] = qtde;
        });

        // Algoritmo para calcular a distribuição
        const ESPACAMENTO_ENTRE_CIAS = (Object.keys(cias).length - 1) * 2;

        let somaCias = 0;
        for(const su in cias) {
            somaCias += cias[su];
        }

        const totalUsado = ESPACAMENTO_ENTRE_CIAS + somaCias;

        let sobras = PATIO - totalUsado;

        if(sobras < 0) {
            alert(`Erro: O tamanho total necessário (${totalUsado}) é maior que o tamanho do pátio (${PATIO})`);
            return;
        }

        if(sobras % 2 === 1) {
            --sobras;
        }

        const deCadaLado = sobras / 2;

        // Gerar resultado
        let resultado = `Pátio vazio de 1 a ${deCadaLado}\n`;
        let ultimaPosicao = deCadaLado;

        const ciaKeys = Object.keys(cias);
        const qtdeCias = ciaKeys.length;

        // Armazenar blocos para visualização
        const blocos = [];

        // Adicionar bloco do pátio vazio inicial
        blocos.push({
            tipo: 'vazio',
            inicio: 1,
            fim: deCadaLado,
            nome: 'Pátio vazio'
        });

        for(let i = 0; i < qtdeCias; i++) {
            const su = ciaKeys[i];
            const qtde = cias[su];

            const inicio = ultimaPosicao + 1;
            const final = ultimaPosicao + qtde;

            resultado += `${su}: de ${inicio} a ${final}\n`;

            // Adicionar bloco de Cia
            blocos.push({
                tipo: 'cia',
                inicio: inicio,
                fim: final,
                nome: su
            });

            if(i !== qtdeCias - 1) {
                const primeiroEspaco = final + 1;
                const segundoEspaco = final + 2;

                resultado += `espaço de ${primeiroEspaco} a ${segundoEspaco}\n`;
                ultimaPosicao = segundoEspaco;

                // Adicionar bloco de espaço
                blocos.push({
                    tipo: 'espaco',
                    inicio: primeiroEspaco,
                    fim: segundoEspaco,
                    nome: 'Espaço'
                });
            } else {
                ultimaPosicao = final;
            }
        }

        const inicioTerminoPatio = ultimaPosicao + 1;
        const terminoTermino = PATIO;

        resultado += `Pátio vazio de ${inicioTerminoPatio} a ${terminoTermino}\n`;

        // Adicionar bloco do pátio vazio final
        blocos.push({
            tipo: 'vazio',
            inicio: inicioTerminoPatio,
            fim: terminoTermino,
            nome: 'Pátio vazio'
        });

        // Exibir resultado
        resultadoContent.textContent = resultado;

        // Criar visualização gráfica
        criarVisualizacao(blocos, PATIO);
    }

// Função para criar a visualização gráfica da distribuição - versão vertical simples
function criarVisualizacao(blocos, tamanhoTotal) {
    // Limpar qualquer conteúdo anterior
    visualization.innerHTML = '';
    
    // Filter out "vazio" blocks (opcional - você pode decidir se quer mostrar ou não os blocos vazios)
    const blocosVisiveis = blocos.filter(bloco => bloco.tipo !== 'vazio');
    
    // Calculate space taken by visible blocks
    const espacoVisivel = blocosVisiveis.reduce((total, bloco) => {
        return total + (bloco.fim - bloco.inicio + 1);
    }, 0);
    
    // Definição de cores para cada tipo de bloco
    const coresBlocos = {
        'cia': '#3498db',      // Azul
        'espaco': '#e74c3c',   // Vermelho
        'vazio': '#95a5a6'     // Cinza
    };
    
    // Render visible blocks with adjusted proportions
    blocosVisiveis.forEach(bloco => {
        const elemento = document.createElement('div');
        elemento.className = 'patio-block';
        
        // Calculate height based on proportion of visible space
        const altura = ((bloco.fim - bloco.inicio + 1) / espacoVisivel) * 100;
        
        // Calculate position based on preceding visible blocks
        let posicaoAcumulada = 0;
        for (let i = 0; i < blocosVisiveis.indexOf(bloco); i++) {
            posicaoAcumulada += (blocosVisiveis[i].fim - blocosVisiveis[i].inicio + 1);
        }
        const posicao = (posicaoAcumulada / espacoVisivel) * 100;
        
        // Configurar estilos para o bloco
        elemento.style.height = `${altura}%`;
        elemento.style.top = `${posicao}%`;
        elemento.style.backgroundColor = coresBlocos[bloco.tipo] || '#999';
        
        // Adicionar dataset para identificação do tipo de bloco
        elemento.dataset.tipo = bloco.tipo;
        
        // Adicionar texto (se couber)
        const texto = `${bloco.nome} (${bloco.inicio}-${bloco.fim})`;
        elemento.title = texto;  // Adicionar como tooltip
        elemento.textContent = texto;
        
        visualization.appendChild(elemento);
    });
}
<<<<<<< Updated upstream
});
=======
});
>>>>>>> Stashed changes
