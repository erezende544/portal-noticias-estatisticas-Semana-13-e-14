/**
 * ESTATÍSTICAS DO PORTAL DE NOTÍCIAS
 * Gráficos com Chart.js - VERSÃO CORRIGIDA
 */

// Cores para os gráficos
const CORES = [
    '#2563eb', '#3b82f6', '#1d4ed8', '#60a5fa', '#1e40af',
    '#ef4444', '#f59e0b', '#10b981', '#8b5cf6', '#ec4899',
    '#06b6d4', '#84cc16', '#f97316', '#6366f1', '#d946ef'
];

// Variáveis globais para os gráficos
let graficoCategorias = null;
let graficoMensal = null;

/**
 * CARREGA E PROCESSA OS DADOS PARA OS GRÁFICOS
 */
async function carregarEstatisticas() {
    try {
        console.log('Carregando dados para estatísticas...');

        const response = await fetch('http://localhost:3030/noticias');

        if (!response.ok) {
            throw new Error('Erro ao carregar dados da API');
        }

        const noticias = await response.json();
        console.log('Dados carregados:', noticias.length, 'notícias');

        // Processa os dados
        processarDados(noticias);

    } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
        mostrarErroGráficos();
    }
}

/**
 * MOSTRA MENSAGEM DE ERRO NOS GRÁFICOS
 */
function mostrarErroGráficos() {
    const containerCategorias = document.getElementById('graficoCategorias');
    const containerMensal = document.getElementById('graficoMensal');

    if (containerCategorias) {
        containerCategorias.innerHTML = '<p class="text-center text-danger p-3">Erro ao carregar gráfico de categorias</p>';
    }
    if (containerMensal) {
        containerMensal.innerHTML = '<p class="text-center text-danger p-3">Erro ao carregar gráfico mensal</p>';
    }
}

/**
 * PROCESSAMENTO DOS DADOS E CRIAÇÃO DOS GRÁFICOS
 */
function processarDados(noticias) {
    console.log('Processando dados para gráficos...');

    // Destrói gráficos existentes
    if (graficoCategorias) {
        graficoCategorias.destroy();
    }
    if (graficoMensal) {
        graficoMensal.destroy();
    }

    // 1. DADOS PARA CARDS DE RESUMO
    atualizarCardsResumo(noticias);

    // 2. GRÁFICO DE CATEGORIAS (Pizza)
    criarGraficoCategorias(noticias);

    // 3. GRÁFICO MENSAL (Barras)
    criarGraficoMensal(noticias);
}

/**
 * ATUALIZA OS CARDS COM RESUMO
 */
function atualizarCardsResumo(noticias) {
    console.log('Atualizando cards de resumo...');

    const totalNoticias = noticias.length;
    const totalDestaques = noticias.filter(n => n.destaque).length;

    // Categorias únicas
    const categorias = [...new Set(noticias.map(n => n.categoria).filter(Boolean))];

    // Autores únicos
    const autores = [...new Set(noticias.map(n => n.autor).filter(Boolean))];

    // Atualiza os elementos de forma segura
    atualizarElemento('totalNoticias', totalNoticias);
    atualizarElemento('totalDestaques', totalDestaques);
    atualizarElemento('totalCategorias', categorias.length);
    atualizarElemento('totalAutores', autores.length);
}

/**
 * ATUALIZA ELEMENTO DE FORMA SEGURA
 */
function atualizarElemento(id, valor) {
    const elemento = document.getElementById(id);
    if (elemento) {
        elemento.textContent = valor;
    } else {
        console.warn('Elemento não encontrado:', id);
    }
}

/**
 * CRIA GRÁFICO DE PIZZA - DISTRIBUIÇÃO POR CATEGORIA
 */
function criarGraficoCategorias(noticias) {
    const canvas = document.getElementById('graficoCategorias');
    if (!canvas) {
        console.error('Canvas graficoCategorias não encontrado!');
        return;
    }

    // Agrupa notícias por categoria
    const categoriasCount = {};
    noticias.forEach(noticia => {
        const categoria = noticia.categoria || 'Sem Categoria';
        categoriasCount[categoria] = (categoriasCount[categoria] || 0) + 1;
    });

    const labels = Object.keys(categoriasCount);
    const data = Object.values(categoriasCount);

    console.log('Dados gráfico categorias:', { labels, data });

    const ctx = canvas.getContext('2d');

    graficoCategorias = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: CORES.slice(0, labels.length),
                borderColor: '#ffffff',
                borderWidth: 2,
                hoverOffset: 10
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        usePointStyle: true,
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = Math.round((value / total) * 100);
                            return `${label}: ${value} notícia${value !== 1 ? 's' : ''} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

/**
 * CRIA GRÁFICO DE BARRAS - NOTÍCIAS POR MÊS
 */
function criarGraficoMensal(noticias) {
    const canvas = document.getElementById('graficoMensal');
    if (!canvas) {
        console.error('Canvas graficoMensal não encontrado!');
        return;
    }

    // Agrupa notícias por mês/ano
    const mensalCount = {};

    noticias.forEach(noticia => {
        if (noticia.data) {
            try {
                const date = new Date(noticia.data);
                // Formata como "Nov/2025"
                const mesAno = `${date.toLocaleDateString('pt-BR', { month: 'short' })}/${date.getFullYear()}`;
                const chave = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

                if (!mensalCount[chave]) {
                    mensalCount[chave] = {
                        display: mesAno,
                        count: 0
                    };
                }
                mensalCount[chave].count++;
            } catch (e) {
                console.warn('Data inválida:', noticia.data);
            }
        } else {
            // Se não tem data, agrupa como "Sem Data"
            if (!mensalCount['sem-data']) {
                mensalCount['sem-data'] = {
                    display: 'Sem Data',
                    count: 0
                };
            }
            mensalCount['sem-data'].count++;
        }
    });

    // Ordena por data (exceto "Sem Data" que vai pro final)
    const entries = Object.entries(mensalCount)
        .sort(([a], [b]) => {
            if (a === 'sem-data') return 1;
            if (b === 'sem-data') return -1;
            return a.localeCompare(b);
        });

    const labels = entries.map(([_, data]) => data.display);
    const data = entries.map(([_, data]) => data.count);

    console.log('Dados gráfico mensal:', { labels, data });

    const ctx = canvas.getContext('2d');

    graficoMensal = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Notícias Publicadas',
                data: data,
                backgroundColor: '#2563eb',
                borderColor: '#1e40af',
                borderWidth: 1,
                borderRadius: 4,
                borderSkipped: false,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1,
                        precision: 0
                    },
                    grid: {
                        drawBorder: false
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            return `Notícias: ${context.raw}`;
                        }
                    }
                }
            }
        }
    });
}

/**
 * INICIALIZAÇÃO DA PÁGINA
 */
document.addEventListener('DOMContentLoaded', function () {
    console.log('Página de estatísticas - Inicializando...');

    // Verifica se Chart.js está carregado
    if (typeof Chart === 'undefined') {
        console.error('Chart.js não foi carregado!');
        mostrarErroGráficos();
        return;
    }

    // Pequeno delay para garantir que tudo está carregado
    setTimeout(() => {
        carregarEstatisticas();
    }, 500);
});