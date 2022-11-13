const divProducts = document.querySelector('#products');
const divCartList = document.querySelector('#divCartList');
const btnCart = document.querySelector('#btnCart');
let basket = [];
const localUpdate = () => localStorage.setItem('basket', JSON.stringify(basket, undefined, 4));

const fetchProducts = async () => {
    try {
        const findProducts = await (await fetch('https://fakestoreapi.com/products/')).json();
        divProducts.innerHTML = '';
        findProducts.forEach(product => {
            let divProduct = document.createElement('div');
            divProduct.classList.add('col');
            divProduct.innerHTML = `<div class="card">
            <img src="${product.image}" class="card-img-top p-2" style="height: 300px; object-fit: cover;" alt="product">
            <div class="card-body p-3">
              <h6 class="card-title mb-0">${product.title.substring(0, 17)}...</h6>
              <p class="text-muted mb-3" style="font-size:0.9em;">${product.category}</p>
              <div class="row justify-content-between">
                <div class="col-8"><p class="text-body fs-6">₺${product.price}</p></div>
                <div id="divBtn_${product.id}" class="col-4 text-end">
                <button type="button" onclick="addProduct(${product.id})" class="btn btn-outline-success btn-sm">Add</button>
                </div>
              </div>
            </div>
        </div>`
            divProducts.appendChild(divProduct);
        });

        console.log(findProducts);
    } catch (error) {
        console.error(error.value);
    }
};

const addProduct = (itemId) => {
    let divBtn = document.querySelector(`#divBtn_${itemId}`);
    basket.push(itemId);
    localUpdate();
    divBtn.innerHTML = `<button type="button" onclick="addProduct(${itemId})" class="btn btn-success btn-sm position-relative">Add <span id="totalPrdct_${itemId}" class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">${basket.filter((n) => { return n == itemId }).length}</span></button>`;


    if (document.querySelector('#btnCart span') == null) {
        let cartCounter = document.createElement('span');
        cartCounter.className = 'position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger';
        cartCounter.textContent = basket.length;
        btnCart.appendChild(cartCounter);
    } else {
        document.querySelector('#btnCart span').textContent = basket.length;
    }
};

btnCart.addEventListener('click', async () => {
    try {
        if (basket.length > 0) {
            divCartList.innerHTML = '';
            let totalPrice = 0;
            let divTotalPrice = document.createElement('p');
            const myCartFilter = await (await fetch('https://fakestoreapi.com/products/')).json();
            myCartFilter.filter(item => {
                if (basket.includes(item.id)) {
                    let newCartProduct = document.createElement('div');
                    newCartProduct.id = `productInCart_${item.id}`
                    newCartProduct.className = 'row m-3 justify-content-between border-bottom pb-2';
                    newCartProduct.innerHTML = `<div class="col-2"><img src="${item.image}" width="60" style="object-fit: cover;"></div>
                <div class="col-6">
                    <p class="m-0">${item.title.substring(0, 15)}...</p>
                    <p class="m-0">
                    ₺<span id="productPriceInCart_${item.id}">${item.price}</span> 
                    <button type="button" onclick="negative(${item.id})" class="btn btn-outline-secondary btn-sm">-</button>
                    <span id="productCount_${item.id}">${basket.filter((n) => { return n == item.id }).length}</span>
                    <button type="button" onclick="positive(${item.id})" class="btn btn-outline-secondary btn-sm">+</button>
                    </p>
                </div>
                <div class="col-3 align-self-center">
                    <button type="button" onclick="deleteAll(${item.id})" class="btn btn-outline-danger">Delete</button>
                </div>`;
                    divCartList.appendChild(newCartProduct);
                    totalPrice += item.price * basket.filter((n) => { return n == item.id }).length;
                }
            });
            divTotalPrice.id = 'totalPriceInCart'
            divTotalPrice.className = 'px-3 text-start';
            divTotalPrice.innerHTML = '<b>Total:</b> ₺ <span>' + totalPrice + '</span>';
            divCartList.appendChild(divTotalPrice);
        } else {
            divCartList.innerHTML = '<div class="alert alert-warning m-0 text-center" role="alert">No products in your cart—Fındık is hungry!</div>'
        }
    } catch (error) {
        console.error(error);
    }
});



function negative(requestID) {
    basket.splice(basket.indexOf(requestID), 1);
    localUpdate();
    let leftProduct = basket.filter((n) => { return n == requestID }).length;
    if (leftProduct > 0) {
        document.querySelector(`#totalPriceInCart span`).textContent = (document.querySelector(`#totalPriceInCart span`).textContent - document.querySelector(`#productPriceInCart_${requestID}`).textContent).toFixed(2);

        document.querySelector(`#productCount_${requestID}`).innerHTML = `${leftProduct}`;
        document.querySelector(`#totalPrdct_${requestID}`).innerHTML = `${leftProduct}`;
    } else {
        document.querySelector(`#totalPriceInCart span`).textContent = (document.querySelector(`#totalPriceInCart span`).textContent - document.querySelector(`#productPriceInCart_${requestID}`).textContent).toFixed(2);

        document.querySelector(`#divBtn_${requestID} button`).classList.replace('btn-success', 'btn-outline-success');
        document.querySelector(`#productCount_${requestID}`).remove();
        document.querySelector(`#totalPrdct_${requestID}`).remove();
        document.querySelector(`#productInCart_${requestID}`).remove();
    }
    if (basket.length > 0) {
        document.querySelector('#btnCart span').textContent = basket.length;
    } else {
        document.querySelector('#btnCart span').remove();
        divCartList.innerHTML = '<div class="alert alert-warning m-0 text-center" role="alert">No products in your cart—Fındık is hungry!</div>'
    }
}

function positive(requestID) {
    basket.push(requestID);
    localUpdate();
    let leftProduct = basket.filter((n) => { return n == requestID }).length;
    document.querySelector(`#productCount_${requestID}`).innerHTML = `${leftProduct}`;
    document.querySelector(`#totalPrdct_${requestID}`).innerHTML = `${leftProduct}`;
    document.querySelector('#btnCart span').textContent = basket.length;

    document.querySelector(`#totalPriceInCart span`).textContent = (parseFloat(document.querySelector(`#totalPriceInCart span`).textContent) + parseFloat(document.querySelector(`#productPriceInCart_${requestID}`).textContent)).toFixed(2);
}

function deleteAll(requestID) {
    // to remove multiple items in array
    let willDelete = [];
    basket.forEach((n, i) => {
        n == requestID ? willDelete.push(i) : null;
    });
    for (var i = willDelete.length - 1; i >= 0; i--) basket.splice(willDelete[i], 1);
    document.querySelector(`#divBtn_${requestID} button`).classList.replace('btn-success', 'btn-outline-success');
    document.querySelector(`#productCount_${requestID}`).remove();
    document.querySelector(`#totalPrdct_${requestID}`).remove();
    document.querySelector(`#productInCart_${requestID}`).remove();
    if (basket.length > 0) {
        document.querySelector('#btnCart span').textContent = basket.length;
    } else {
        document.querySelector('#btnCart span').remove();
        divCartList.innerHTML = '<div class="alert alert-warning m-0 text-center" role="alert">No products in your cart—Fındık is hungry!</div>'
    }
}

fetchProducts();
