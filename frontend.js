let productList = document.querySelector('.productWrap')
productList.addEventListener('click',(el) => {
    // 防止跳轉
    el.preventDefault()
    if (el.target.getAttribute('class') === 'addCardBtn') {
                
    }
    
})

// API抓取商品表
axios.get('https://livejs-api.hexschool.io/api/livejs/v1/customer/chinging/products')
    .then((res) => {
        let data = res.data.products
        console.log(data);
        let productText = ''
       data.forEach(item => {
        productText += `
        <li class="productCard">
        <h4 class="productType">新品</h4>
        <img
          src="${item.images}"
          alt="${item.title}"
        />
        <a href="#" class="addCardBtn" data-id="${item.id}">加入購物車</a>
        <h3>${item.title}</h3>
        <del class="originPrice">NT$${item.origin_price}</del>
        <p class="nowPrice">NT$${item.price}</p>
      </li>
        `
       });
       productList.innerHTML = productText

    }).catch((err) => {
        console.log(err);
    });


