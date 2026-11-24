// 01 - IMPORTAÇÕES
import './style.css'
import foneImg from './assets/fone-de-ouvido.jpg'
import tecladoImg from './assets/teclado.jpg'
import mouseImg from './assets/mouse.jpg'

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
const valorFrete = document.querySelector('#shipping-value')
const valorTotal = document.querySelector('#total-value')

// 05 - FUNÇÕES AUXILIARES
function formatarPreco(valor) {
    return valor.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    })
}

// Restaura o estado inicial dos formulários.
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
    const { quantidadeTotal } = resumo
    const itens = quantidadeTotal === 1 ? 'item' : 'itens'
    contadorCarrinho.textContent = quantidadeTotal
    botaoCarrinho.setAttribute('aria-label', `Ver carrinho, ${quantidadeTotal} ${itens}`)


    // Atualiza o subtotal e a quantidade de itens.
    rotuloSubtotal.textContent =
        `Subtotal (${quantidadeTotal} ${itens})`

    valorSubtotal.textContent =
        formatarPreco(resumo.subtotal)


    // Atualiza o desconto.
    valorDesconto.textContent =
        `− ${formatarPreco(resumo.desconto)}`

    linhaDesconto.hidden =
        !cupomAplicado || resumo.quantidadeTotal === 0


    // Atualiza o valor das garantias.
    valorGarantia.textContent =
        formatarPreco(resumo.garantiaTotal)


    // Exibe a calculadora somente quando houver frete pago.
    calculadoraFrete.hidden =
        resumo.frete === 0

    valorFrete.textContent =
        `Frete: ${formatarPreco(resumo.frete)}`


    // Atualiza o valor final.
    valorTotal.textContent =
        formatarPreco(resumo.total)


    // Impede finalizar uma compra sem produtos.
    botaoFinalizar.disabled =
        resumo.quantidadeTotal === 0
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
            Remover
        </button>

    </article>
`
    })

    listaProdutos.innerHTML = cards.join('')
    verificarCarrinhoVazio()
    renderizarResumo()
    if (controle) restaurarFocoProduto(controle, indice)
}

// Atualiza a interface quando não existem produtos.
function verificarCarrinhoVazio() {

    const carrinhoVazio = produtos.length === 0

    // Desativa o botão de limpeza quando não há produtos.
    botaoLimpar.disabled = carrinhoVazio

    if (!carrinhoVazio) return

    // Limpa os dados dos formulários.
    limparFormularios()

    // Exibe a mensagem de carrinho vazio.
    listaProdutos.innerHTML = `
        <div class="empty-cart">

            <span class="empty-cart-icon"
                  aria-hidden="true"></span>

            <h2 tabindex="-1">Seu carrinho está vazio</h2>

            <p>Você não possui produtos no carrinho.</p>

        </div>
    `
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
    renderizarProdutos(botao, indice)
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
    renderizarProdutos(evento.target, produtos.indexOf(produto))
})

// Detecta o envio do formulário.
formularioCupom.addEventListener('submit', (evento) => {

    // Impede o recarregamento da página.
    evento.preventDefault()

    // Padroniza o texto digitado.
    const codigo = campoCupom.value.trim().toUpperCase()

    // Verifica se existem produtos no carrinho.
    if (produtos.length === 0) {

        mensagemCupom.textContent = 'Seu carrinho está vazio.'
        mensagemCupom.hidden = false

        return
    }

    // Verifica se o cupom é válido.
    cupomAplicado = codigo === CUPOM_VALIDO

    // Exibe a mensagem correspondente.
    if (cupomAplicado) {

        mensagemCupom.textContent = 'Cupom aplicado com sucesso!'

    } else {

        mensagemCupom.textContent = 'Cupom inválido.'

    }

    mensagemCupom.hidden = false

    // Atualiza os valores da compra.
    renderizarResumo()
})

// Formata o CEP enquanto o usuário digita.
campoCep.addEventListener('input', () => {

    // Remove caracteres que não sejam números.
    const numeros = campoCep.value.replace(/\D/g, '').slice(0, 8)

    // Adiciona o hífen depois do quinto número.
    campoCep.value = numeros.replace(/^(\d{5})(\d)/, '$1-$2')

    // Oculta a mensagem anterior.
    mensagemFrete.hidden = true
})

// Detecta o envio do formulário.
formularioFrete.addEventListener('submit', (evento) => {

    evento.preventDefault()

    // Verifica se o CEP possui o formato correto.
    const cepValido = /^\d{5}-\d{3}$/.test(campoCep.value)

    if (!cepValido) {

        mensagemFrete.textContent = 'Informe um CEP válido.'

    } else {

        mensagemFrete.textContent =
            `Frete simulado: ${formatarPreco(VALOR_FRETE)}`

    }

    mensagemFrete.hidden = false
})

// Detecta o clique no botão de limpar carrinho.
botaoLimpar.addEventListener('click', () => {

    if (produtos.length === 0) return

    // Solicita a confirmação do usuário.
    const confirmou = window.confirm(
        'Deseja remover todos os produtos do carrinho?'
    )

    if (!confirmou) return

    // Remove todos os produtos do array.
    produtos.splice(0, produtos.length)

    // Atualiza a interface.
    renderizarProdutos(botaoLimpar, 0)
})

botaoFinalizar.addEventListener('click', () => {

    // Impede finalizar um carrinho vazio.
    if (produtos.length === 0) return

    // Obtém os valores atualizados da compra.
    const resumo = calcularResumo()

    // Exibe a confirmação simulada.
    window.alert(
        `Pedido finalizado com sucesso!\n\n` +
        `Quantidade de itens: ${resumo.quantidadeTotal}\n` +
        `Total: ${formatarPreco(resumo.total)}\n\n` +
        `Esta é uma compra simulada.`
    )
})

// 09 - INICIALIZAÇÃO
renderizarProdutos()
