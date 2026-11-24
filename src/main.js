// 01 - IMPORTAÇÕES
import './style.css'
import foneImg from './assets/fone-de-ouvido.jpg'
import tecladoImg from './assets/teclado.jpg'
import mouseImg from './assets/mouse.jpg'
import { Currency } from 'lucide'

// 02 - CONSTANTES E CONFIGURAÇÕES
const PRECO_GARANTIA = 49.90
const LIMITE_FRETE_GRATIS = 300
const VALOR_FRETE = 19.90
const PERCENTUAL_DESCONTO = 0.10
const CUPOM_VALIDO = 'TECH10'

// 03 - DADOS E ESTADO
let cupomAplicado = false

const produtos = [
    {
        id: 1,
        nome: "Fone Bluetooth Pro",
        descricao: 'Áudio imersivo e cancelamento de ruído',
        preco: 349.90,
        imagem: foneImg,
        quantidade: 1,
        garantia: true
    },
    {
        id: 2,
        nome: 'Teclado Mecânico RGB',
        descricao: 'Switches mecânicos e iluminação RGB',
        preco: 299.90,
        imagem: tecladoImg,
        quantidade: 1,
        garantia: false
    },
    {
        id: 3,
        nome: 'Mouse Gamer',
        descricao: 'Alta precisão e sensor óptico',
        preco: 159.90,
        imagem: mouseImg,
        quantidade: 1,
        garantia: true
    }
]

// 04 - SELETORES DO DOM
const listaProdutos = document.querySelector('#products-list')

// 05 - FUNÇÕES AUXILIARES
function formatarPreco(valor) {
    return valor.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    })
}

// 06 - FUNÇÕES DE CÁLCULO
function calcularTotalProduto(produto) {
    const subtotal = produto.preco * produto.quantidade
    const totalGarantia = produto.garantia
        ? PRECO_GARANTIA * produto.quantidade
        : 0

    return subtotal + totalGarantia
}
function calcularResumo() {

    // Soma as quantidades de todos os produtos.
    const quantidadeTotal = produtos.reduce((acumulador, produto) => {
        return acumulador + produto.quantidade
    }, 0)


    // Soma o valor dos produtos sem garantia.
    const subtotal = produtos.reduce((acumulador, produto) => {
        return acumulador + produto.preco * produto.quantidade
    }, 0)


    // Soma somente as garantias selecionadas.
    const garantiaTotal = produtos.reduce((acumulador, produto) => {

        if (produto.garantia) {
            return acumulador + PRECO_GARANTIA * produto.quantidade
        }

        return acumulador

    }, 0)

    // Aplica o desconto quando o cupom estiver ativo.
    const desconto = cupomAplicado
        ? subtotal * PERCENTUAL_DESCONTO
        : 0


    // Cobra frete apenas quando necessário.
    const frete = quantidadeTotal > 0 && subtotal < LIMITE_FRETE_GRATIS
        ? VALOR_FRETE
        : 0


    // Calcula o valor final da compra.
    const total = subtotal - desconto + garantiaTotal + frete


    // Retorna todos os resultados em um objeto.
    return {
        quantidadeTotal,
        subtotal,
        garantiaTotal,
        desconto,
        frete,
        total
    }
}

// 07 - FUNÇÕES DE RENDERIZAÇÃO
function renderizarResumo() {

    // Obtém os valores calculados.
    const resumo = calcularResumo()


    // Atualiza a quantidade no cabeçalho.
    document.querySelector('.cart-count').textContent =
        resumo.quantidadeTotal


    // Atualiza o subtotal e a quantidade de itens.
    document.querySelector('#subtotal-label').textContent =
        `Subtotal (${resumo.quantidadeTotal} ${resumo.quantidadeTotal === 1 ? 'item' : 'itens'})`

    document.querySelector('#subtotal-value').textContent =
        formatarPreco(resumo.subtotal)


    // Atualiza o desconto.
    document.querySelector('#discount-value').textContent =
        `− ${formatarPreco(resumo.desconto)}`

    document.querySelector('#discount-row').hidden =
        !cupomAplicado || resumo.quantidadeTotal === 0


    // Atualiza o valor das garantias.
    document.querySelector('#warranty-value').textContent =
        formatarPreco(resumo.garantiaTotal)


    // Exibe a calculadora somente quando houver frete pago.
    document.querySelector('#shipping-calculator').hidden =
        resumo.frete === 0

    document.querySelector('#shipping-value').textContent =
        `Frete: ${formatarPreco(resumo.frete)}`


    // Atualiza o valor final.
    document.querySelector('#total-value').textContent =
        formatarPreco(resumo.total)


    // Impede finalizar uma compra sem produtos.
    document.querySelector('#checkout-button').disabled =
        resumo.quantidadeTotal === 0
}

function renderizarProdutos() {
    const cards = produtos.map((produto) => {

       return `
    <article class="product-card" data-id="${produto.id}">

        <!-- Imagem do produto -->
        <img
            class="product-image"
            src="${produto.imagem}"
            alt="${produto.nome}"
        >

        <!-- Informações principais -->
        <div class="product-info">

            <h3 class="product-name">
                ${produto.nome}
            </h3>

            <p class="product-description">
                ${produto.descricao}
            </p>

            <strong class="product-price">
                ${formatarPreco(produto.preco)}
            </strong>

        </div>

        <!-- Garantia estendida -->
        <label class="product-warranty">

            <input
                type="checkbox"
                class="warranty-checkbox"
                data-id="${produto.id}"
                ${produto.garantia ? 'checked' : ''}
            >

            <span>
                Garantia estendida (+12 meses)
                <small>${formatarPreco(PRECO_GARANTIA)}</small>
            </span>

        </label>

        <!-- Controle de quantidade -->
        <div class="quantity-control">

            <button
                class="quantity-minus"
                type="button"
                data-id="${produto.id}"
                aria-label="Diminuir quantidade de ${produto.nome}"
                ${produto.quantidade === 1 ? 'disabled' : ''}
            >
                −
            </button>

            <span class="quantity-value">
                ${produto.quantidade}
            </span>

            <button
                class="quantity-plus"
                type="button"
                data-id="${produto.id}"
                aria-label="Aumentar quantidade de ${produto.nome}"
            >
                +
            </button>

        </div>

        <!-- Preço total individual -->
        <strong class="product-total">
            ${formatarPreco(calcularTotalProduto(produto))}
        </strong>

        <!-- Remover produto -->
        <button
            class="remove-product"
            type="button"
            data-id="${produto.id}"
            aria-label="Remover ${produto.nome} do carrinho"
        >
            Remover
        </button>

    </article>
`
    })

    listaProdutos.innerHTML = cards.join('')
    renderizarResumo()
}

// 08 - EVENTOS
/* ========================================
   INTERAÇÕES DOS PRODUTOS
======================================== */

// Detecta cliques dentro da lista de produtos.
listaProdutos.addEventListener('click', (evento) => {

    // Identifica o botão clicado, inclusive se houver ícones dentro dele.
    const botao = evento.target.closest('button')

    // Ignora cliques fora dos botões.
    if (!botao) return

    // Descobre a qual produto o botão pertence.
    const id = Number(botao.dataset.id)

    // Localiza o produto correspondente no array.
    const indice = produtos.findIndex((produto) => produto.id === id)

    // Interrompe se o produto não existir.
    if (indice === -1) return

    const produto = produtos[indice]

    // Aumenta a quantidade.
    if (botao.classList.contains('quantity-plus')) {
        produto.quantidade++
    }

    // Diminui a quantidade, respeitando o mínimo de 1.
    if (botao.classList.contains('quantity-minus')) {
        produto.quantidade = Math.max(1, produto.quantidade - 1)
    }

    // Remove o produto do array.
    if (botao.classList.contains('remove-product')) {
        produtos.splice(indice, 1)
    }

    // Atualiza os cards após a alteração.
    renderizarProdutos()
})


// Detecta alterações nos checkboxes de garantia.
listaProdutos.addEventListener('change', (evento) => {

    // Verifica se a alteração veio de uma garantia.
    if (!evento.target.matches('.warranty-checkbox')) return

    const id = Number(evento.target.dataset.id)

    // Encontra o produto associado à garantia.
    const produto = produtos.find((item) => item.id === id)

    if (!produto) return

    // Atualiza o estado conforme o checkbox.
    produto.garantia = evento.target.checked

    // Atualiza o preço exibido.
    renderizarProdutos()
})

// 09 - INICIALIZAÇÃO
renderizarProdutos()
