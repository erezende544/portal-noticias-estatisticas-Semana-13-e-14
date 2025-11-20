/**
 * SCRIPT DE DIAGNÓSTICO - Use no console do navegador
 */
function diagnosticarEstatisticas() {
    console.log('=== DIAGNÓSTICO ESTATÍSTICAS ===');

    // Verifica elementos
    console.log('Canvas categorias:', document.getElementById('graficoCategorias'));
    console.log('Canvas mensal:', document.getElementById('graficoMensal'));

    // Verifica Chart.js
    console.log('Chart.js carregado:', typeof Chart);

    // Verifica funções
    console.log('carregarEstatisticas:', typeof carregarEstatisticas);
    console.log('loadHeader:', typeof loadHeader);

    // Testa API
    fetch('http://localhost:3030/noticias')
        .then(r => {
            console.log('Status API:', r.status);
            return r.json();
        })
        .then(data => {
            console.log('Dados API:', data);
        })
        .catch(err => {
            console.error('Erro API:', err);
        });
}

// Executa diagnóstico quando a página carregar
document.addEventListener('DOMContentLoaded', function () {
    setTimeout(diagnosticarEstatisticas, 1000);
});