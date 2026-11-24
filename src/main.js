// 01 - IMPORTAÇÕES
import './style.css'
import foneImg from './assets/fone-de-ouvido.jpg'
import tecladoImg from './assets/teclado.jpg'
import mouseImg from './assets/mouse.jpg'
import { ArrowLeft, createElement, createIcons, Lock, Menu, ShoppingBag, ShoppingCart, Tag, Trash2, Truck, X } from 'lucide'

// 02 - CONSTANTES E CONFIGURAÇÕES
const PRECO_GARANTIA = 49.90
const LIMITE_FRETE_GRATIS = 300
const VALOR_FRETE = 19.90
const PERCENTUAL_DESCONTO = 0.10
const CUPOM_VALIDO = 'TECH10'

const iconesLucide = { ArrowLeft, Lock, ShoppingBag, ShoppingCart, Tag, Trash2, Truck }
const telaMobile = window.matchMedia('(max-width: 900px)')

// 03 - DADOS E ESTADO
let cupomAplicado = false
let freteCalculado = false

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
const formularioCupom = document.querySelector('#coupon-form')
const campoCupom = document.querySelector('#coupon-input')
const mensagemCupom = document.querySelector('#coupon-message')
const formularioFrete = document.querySelector('#shipping-form')
const campoCep = document.querySelector('#cep-input')
const mensagemFrete = document.querySelector('#shipping-message')
const botaoLimpar = document.querySelector('.clear-cart-button')
const botaoFinalizar = document.querySelector('#checkout-button')
const contadorCarrinho = document.querySelector('.cart-count')
const botaoCarrinho = document.querySelector('.cart-button')
const rotuloSubtotal = document.querySelector('#subtotal-label')
const valorSubtotal = document.querySelector('#subtotal-value')
const valorDesconto = document.querySelector('#discount-value')
const linhaDesconto = document.querySelector('#discount-row')
const valorGarantia = document.querySelector('#warranty-value')
const calculadoraFrete = document.querySelector('#shipping-calculator')
const resultadoFrete = document.querySelector('#shipping-result')
const valorFrete = document.querySelector('#shipping-value')
const rotuloTotal = document.querySelector('#total-label')
const valorTotal = document.querySelector('#total-value')

const navegacaoPrincipal = document.querySelector('#main-navigation')
const botaoMenu = document.querySelector('.menu-toggle')
const iconeMenu = document.querySelector('.menu-icon')

// 05 - FUNÇÕES AUXILIARES
function formatarPreco(valor) {
    return valor.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    })
}

function limparFormularios() {
    cupomAplicado = false

    campoCupom.value = ''
    mensagemCupom.textContent = ''
    mensagemCupom.hidden = true

    campoCep.value = ''
    mensagemFrete.textContent = ''
    mensagemFrete.hidden = true
}

function restaurarFocoProduto(controle, indice) {
    if (produtos.length === 0) {
        listaProdutos.querySelector('.empty-cart h2').focus()
        return
    }

    const produto = produtos[Math.min(indice, produtos.length - 1)]
    const card = listaProdutos.querySelector(`article[data-id="${produto.id}"]`)
    const seletor = ['.quantity-plus', '.quantity-minus', '.warranty-checkbox']
        .find((opcao) => controle.matches(opcao))
    const controleAnterior = seletor ? card.querySelector(seletor) : null
    const destino = controleAnterior && !controleAnterior.disabled
        ? controleAnterior
        : card.querySelector('.quantity-plus')
    destino.focus()
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
    const quantidadeTotal = produtos.reduce((acumulador, produto) => {
        return acumulador + produto.quantidade
    }, 0)

    // Soma o valor dos produtos sem garantia.
    const subtotal = produtos.reduce((acumulador, produto) => {
        return acumulador + produto.preco * produto.quantidade
    }, 0)

    const garantiaTotal = produtos.reduce((acumulador, produto) => {
        if (produto.garantia) {
            return acumulador + PRECO_GARANTIA * produto.quantidade
        }

        return acumulador

    }, 0)

    const desconto = cupomAplicado
        ? subtotal * PERCENTUAL_DESCONTO
        : 0

    // Cobra frete apenas quando necessário.
    const exigeCalculoFrete = quantidadeTotal > 0 && subtotal + garantiaTotal < LIMITE_FRETE_GRATIS
    const fretePendente = exigeCalculoFrete && !freteCalculado
    const frete = exigeCalculoFrete && freteCalculado ? VALOR_FRETE : 0

    const total = subtotal - desconto + garantiaTotal + frete

    return {
        quantidadeTotal,
        subtotal,
        garantiaTotal,
        desconto,
        exigeCalculoFrete,
        fretePendente,
        frete,
        total
    }
}

// 07 - FUNÇÕES DE RENDERIZAÇÃO
function renderizarResumo() {
    const resumo = calcularResumo()
    if (!resumo.exigeCalculoFrete) {
        freteCalculado = false
        mensagemFrete.hidden = true
    }

    const { quantidadeTotal } = resumo
    const itens = quantidadeTotal === 1 ? 'item' : 'itens'
    contadorCarrinho.textContent = quantidadeTotal
    botaoCarrinho.setAttribute('aria-label', `Ver carrinho, ${quantidadeTotal} ${itens}`)

    rotuloSubtotal.textContent =
        `Subtotal (${quantidadeTotal} ${itens})`

    valorSubtotal.textContent =
        formatarPreco(resumo.subtotal)

    valorDesconto.textContent =
        `− ${formatarPreco(resumo.desconto)}`

    linhaDesconto.hidden =
        !cupomAplicado || resumo.quantidadeTotal === 0

    valorGarantia.textContent =
        formatarPreco(resumo.garantiaTotal)

    calculadoraFrete.hidden = !resumo.exigeCalculoFrete
    resultadoFrete.hidden = resumo.frete === 0

    valorFrete.textContent =
        `Frete: ${formatarPreco(resumo.frete)}`

    rotuloTotal.textContent = resumo.fretePendente ? 'Total parcial' : 'Total'
    valorTotal.textContent =
        formatarPreco(resumo.total)

    // Impede finalizar uma compra sem produtos ou com frete pendente.
    botaoFinalizar.disabled = resumo.quantidadeTotal === 0 || resumo.fretePendente
}

function renderizarProdutos(controle, indice) {
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
            <i data-lucide="trash-2" aria-hidden="true"></i>
        </button>

    </article>
`
    })

    listaProdutos.innerHTML = cards.join('')
    verificarCarrinhoVazio()
    createIcons({ icons: iconesLucide, root: listaProdutos })
    renderizarResumo()
    if (controle) restaurarFocoProduto(controle, indice)
}

function verificarCarrinhoVazio() {
    const carrinhoVazio = produtos.length === 0

    botaoLimpar.disabled = carrinhoVazio

    if (!carrinhoVazio) return

    limparFormularios()

    listaProdutos.innerHTML = `
        <div class="empty-cart">

            <span class="empty-cart-icon"
                  aria-hidden="true"><i data-lucide="shopping-cart" aria-hidden="true"></i></span>

            <h2 tabindex="-1">Seu carrinho está vazio</h2>

            <p>Você não possui produtos no carrinho.</p>

        </div>
    `
}

function renderizarMenu(aberto) {
    navegacaoPrincipal.classList.toggle('is-open', aberto)
    botaoMenu.setAttribute('aria-expanded', String(aberto))
    botaoMenu.setAttribute('aria-label', aberto ? 'Fechar menu' : 'Abrir menu')
    iconeMenu.replaceChildren(createElement(aberto ? X : Menu, { 'aria-hidden': 'true' }))
}

// 08 - EVENTOS
/* ========================================
   INTERAÇÕES DOS PRODUTOS
======================================== */

listaProdutos.addEventListener('click', (evento) => {
    const botao = evento.target.closest('button')

    if (!botao) return

    const id = Number(botao.dataset.id)

    const indice = produtos.findIndex((produto) => produto.id === id)

    if (indice === -1) return

    const produto = produtos[indice]

    if (botao.classList.contains('quantity-plus')) {
        produto.quantidade++
    }

    // Diminui a quantidade, respeitando o mínimo de 1.
    if (botao.classList.contains('quantity-minus')) {
        produto.quantidade = Math.max(1, produto.quantidade - 1)
    }

    if (botao.classList.contains('remove-product')) {
        produtos.splice(indice, 1)
    }

    renderizarProdutos(botao, indice)
})

listaProdutos.addEventListener('change', (evento) => {
    if (!evento.target.matches('.warranty-checkbox')) return

    const id = Number(evento.target.dataset.id)

    const produto = produtos.find((item) => item.id === id)

    if (!produto) return

    produto.garantia = evento.target.checked

    renderizarProdutos(evento.target, produtos.indexOf(produto))
})

formularioCupom.addEventListener('submit', (evento) => {
    evento.preventDefault()

    const codigo = campoCupom.value.trim().toUpperCase()

    if (produtos.length === 0) {
        mensagemCupom.textContent = 'Seu carrinho está vazio.'
        mensagemCupom.hidden = false

        return
    }

    cupomAplicado = codigo === CUPOM_VALIDO

    if (cupomAplicado) {
        mensagemCupom.textContent = 'Cupom aplicado com sucesso!'

    } else {
        mensagemCupom.textContent = 'Cupom inválido.'

    }

    mensagemCupom.hidden = false

    renderizarResumo()
})

campoCep.addEventListener('input', () => {
    const numeros = campoCep.value.replace(/\D/g, '').slice(0, 8)

    campoCep.value = numeros.replace(/^(\d{5})(\d)/, '$1-$2')

    mensagemFrete.hidden = true
    freteCalculado = false
    renderizarResumo()
})

formularioFrete.addEventListener('submit', (evento) => {
    evento.preventDefault()
    if (!calcularResumo().exigeCalculoFrete) return

    const cepValido = /^\d{5}-\d{3}$/.test(campoCep.value)

    freteCalculado = cepValido
    if (!cepValido) {
        mensagemFrete.textContent = 'Informe um CEP válido.'

    } else {
        mensagemFrete.textContent =
            `Frete simulado: ${formatarPreco(VALOR_FRETE)}`

    }

    mensagemFrete.hidden = false
    renderizarResumo()
})

botaoLimpar.addEventListener('click', () => {
    if (produtos.length === 0) return

    const confirmou = window.confirm(
        'Deseja remover todos os produtos do carrinho?'
    )

    if (!confirmou) return

    produtos.splice(0, produtos.length)

    renderizarProdutos(botaoLimpar, 0)
})

botaoFinalizar.addEventListener('click', () => {
    // Impede finalizar um carrinho vazio.
    if (produtos.length === 0) return

    const resumo = calcularResumo()

    if (resumo.fretePendente) return

    window.alert(
        `Pedido finalizado com sucesso!\n\n` +
        `Quantidade de itens: ${resumo.quantidadeTotal}\n` +
        `Total: ${formatarPreco(resumo.total)}\n\n` +
        `Esta é uma compra simulada.`
    )
})

botaoMenu.addEventListener('click', () => {
    if (!telaMobile.matches) return
    const aberto = !navegacaoPrincipal.classList.contains('is-open')
    renderizarMenu(aberto)
    if (aberto) navegacaoPrincipal.querySelector('a').focus()
})

document.addEventListener('keydown', (evento) => {
    if (evento.key !== 'Escape' || !navegacaoPrincipal.classList.contains('is-open')) return
    evento.preventDefault()
    renderizarMenu(false)
    botaoMenu.focus()
})

document.addEventListener('click', (evento) => {
    if (!navegacaoPrincipal.classList.contains('is-open')) return
    if (navegacaoPrincipal.contains(evento.target) || botaoMenu.contains(evento.target)) return
    const focoNoMenu = navegacaoPrincipal.contains(document.activeElement)
    renderizarMenu(false)
    if (focoNoMenu) botaoMenu.focus()
})

telaMobile.addEventListener('change', ({ matches }) => {
    const focoAtual = document.activeElement
    renderizarMenu(false)
    if (matches && navegacaoPrincipal.contains(focoAtual)) botaoMenu.focus()
    if (!matches && focoAtual === botaoMenu) navegacaoPrincipal.querySelector('a').focus()
})

// 09 - INICIALIZAÇÃO
createIcons({ icons: iconesLucide })
renderizarMenu(false)
renderizarProdutos()
