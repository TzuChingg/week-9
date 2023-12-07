let productList = document.querySelector(".productWrap");
let shopCarts = document.querySelector(".shoppingCart-table");
let buyerForm = document.querySelector(".orderInfo-form");
let sendBtn = document.querySelector(".orderInfo-btn");
let cartsLength = 0
let cartsList = { payment: "ATM" };
let cartsTable = {
    姓名: "name",
    電話: "tel",
    Email: "email",
    寄送地址: "address",
    交易方式: "payment",
};
// =============== 監聽 ===============
let localProduct = {}; // 商品數列表，API POST數量、渲染用資料
productList.addEventListener("click", (el) => {
    // 防止跳轉
    el.preventDefault();
    if (el.target.getAttribute("class") === "addCardBtn") {
        console.log(el.target.dataset.id);
        addCarts(el.target.dataset.id);
    }
});

// 購物車刪除指定品項
shopCarts.addEventListener("click", (el) => {
    el.preventDefault();
    if (typeof el.target.dataset.cartid !== "undefined") {
        axios
            .delete(
                `https://livejs-api.hexschool.io/api/livejs/v1/customer/chinging/carts/${el.target.dataset.cartid}`
            )
            .then((res) => {
                console.log("刪除成功");
                localProduct[el.target.dataset.id] = 0;
                updateProductList();
            })
            .catch((err) => {
                console.log("刪除失敗");
            });
    } else if (el.target.getAttribute("class") == "discardAllBtn") {
        //購物車刪除全部品項
        clearCarts();
    }
});

// 頁面篩選
const productSelector = document.querySelector(".productSelect");
productSelector.addEventListener("change", (el) => {
    const productCard = document.querySelectorAll(".productCard");
    productCard.forEach((item) => {
        if (el.target.value === "全部") {
            item.removeAttribute("style");
        } else {
            if (item.dataset.category !== el.target.value) {
                item.setAttribute("style", "display:none");
            } else {
                item.removeAttribute("style");
            }
        }
    });
});

//買方資訊表
buyerForm.addEventListener("input", (el) => {
    if (el.target.id === "tradeWay") {
        cartsList[cartsTable[el.target.name]] = el.target.value;
    } else {
        let alertText = document.querySelector(
            `[data-message='${el.target.name}']`
        );
        if (el.target.value === "") {
            alertText.removeAttribute("style");
            delete cartsList[cartsTable[el.target.name]];
        } else {
            alertText.setAttribute("style", "display:none;");
            cartsList[cartsTable[el.target.name]] = el.target.value;
        }
    }
});
sendBtn.addEventListener("click", (el) => {
    el.preventDefault();
    if(Object.keys(cartsList).length === 5 && cartsLength !== 0){
        axios.post('https://livejs-api.hexschool.io/api/livejs/v1/customer/chinging/orders', {
            "data": {
                "user": cartsList
              }
        })
        document.querySelector('.orderInfo-form').reset()
        alert('訂單成功送出')
    }else{
        alert('未填寫完成')
    }
});

// =============== 頁面初始化 ===============
// API抓取商品表
axios
    .get(
        "https://livejs-api.hexschool.io/api/livejs/v1/customer/chinging/products"
    )
    .then((res) => {
        let data = res.data.products;
        let productText = "";
        data.forEach((item) => {
            productText += `
        <li class="productCard" data-category="${item.category}">
        <h4 class="productType">新品</h4>
        <img
          src="${item.images}"
          alt="${item.title}"
        />
        <a href="#" class="addCardBtn" data-id="${item.id}">加入購物車</a>
        <h3>${item.title}</h3>
        <del class="originPrice">NT$${item.origin_price}</del>
        <p class="nowPrice">NT$${item.price}</p>
        </li>`;
        });
        productList.innerHTML = productText;
        clearCarts(); // 清理購物車
    })
    .catch((err) => {
        console.log(err);
    });

// =============== function ===============
// API新增品項
function addCarts(productId) {
    if (typeof localProduct[productId] == "undefined") {
        axios
            .post(
                "https://livejs-api.hexschool.io/api/livejs/v1/customer/chinging/carts",
                {
                    data: {
                        productId: productId,
                        quantity: 1,
                    },
                }
            )
            .then((res) => {
                updateProductList();
            })
            .catch((err) => {
                console.log(err);
            });
    } else {
        // 商品數量加1
        localProduct[productId]++;
        axios
            .post(
                "https://livejs-api.hexschool.io/api/livejs/v1/customer/chinging/carts",
                {
                    data: {
                        productId: productId,
                        quantity: localProduct[productId],
                    },
                }
            )
            .then((res) => {
                updateProductList();
            })
            .catch((err) => {
                console.log(err);
            });
    }
}
// 更新頁面清單
function updateProductList() {
    const form = document.querySelector(".shoppingCart-table");
    // 表頭
    let formContent =
        '<tr><th width="40%">品項</th><th width="15%">單價</th><th width="15%">數量</th><th width="15%">金額</th><th width="15%"></th></tr>';
    // 內容
    axios
        .get(
            "https://livejs-api.hexschool.io/api/livejs/v1/customer/chinging/carts"
        )
        .then((res) => {
            cartsLength = res.data.carts.length
            res.data.carts.forEach((item) => {
                formContent += `<tr><td>
        <div class="cardItem-title">
          <img src="${item.product.images}" alt="" />
          <p>${item.product.title}</p>
        </div>
      </td>
      <td>NT$${item.product.price}</td>
      <td>${item.quantity}</td>
      <td>NT$${item.product.price * item.quantity} </td>
      <td class="discardBtn">
        <a href="#" class="material-icons" data-cartId="${item.id}" data-id="${item.product.id
                    }"> clear </a>
      </td></tr>`;
                localProduct[item.product.id] = item.quantity;
            });
            formContent += `<tr><td><a href="#" class="discardAllBtn">刪除所有品項</a></td><td></td><td></td><td><p>總金額</p></td><td>NT$${res.data.finalTotal}</td></tr>`;

            form.innerHTML = formContent;

        })
        .catch((err) => {
            console.log(err);
        });
}

// 清除API購物車
function clearCarts() {
    axios
        .delete(
            "https://livejs-api.hexschool.io/api/livejs/v1/customer/chinging/carts"
        )
        .then((res) => {
            console.log(res.data.message);
            localProduct = {};
            updateProductList();
        })
        .catch((err) => {
            console.log(err);
        });
}
// 獲取API購物車現狀
function getCarts() {
    axios
        .get(
            "https://livejs-api.hexschool.io/api/livejs/v1/customer/chinging/carts"
        )
        .then((res) => {
            console.log(res.data);
        })
        .catch((err) => {
            console.log(err);
        });
}
