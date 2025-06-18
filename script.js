const cashInput = document.getElementById("cash");
const changeDueElement = document.getElementById("change-due");
const drawerSpans = document.querySelectorAll("#drawer span")
const total = document.getElementById("total");
const purchaseBtn = document.getElementById("purchase-btn");

let price = 19.5;
/*let cid = [
  ['PENNY', 1.01],
  ['NICKEL', 2.05],
  ['DIME', 3.1],
  ['QUARTER', 4.25],
  ['ONE', 90],
  ['FIVE', 55],
  ['TEN', 20],
  ['TWENTY', 60],
  ['ONE HUNDRED', 100]
];*/

let cid = [["PENNY", 0.5], ["NICKEL", 0], ["DIME", 0], ["QUARTER", 0], ["ONE", 0], ["FIVE", 0], ["TEN", 0], ["TWENTY", 0], ["ONE HUNDRED", 0]]

total.textContent = price;
const updateCID = (arr) => {
    arr.forEach((row, index) => {
            drawerSpans[index].textContent =`$${row[1]}` 
        })
};

window.onload = () => {
    updateCID(cid);

}

const checkCash = (price, cash, cid) => {
    let customerChange = cash - price;

    if (cash < price) {
        alert("Customer does not have enough money to purchase the item");
        return;
    }
    if (customerChange === 0) {
        changeDueElement.textContent = "No change due - customer paid with exact cash";
        return;
    }
    const result = calculateChange(customerChange, cid);
    updateUI(result);
}

const calculateChange = (customerChange, cid) => {
    const DENOMINATIONS = [
    ["ONE HUNDRED", 100],
    ["TWENTY", 20],
    ["TEN", 10],
    ["FIVE", 5],
    ["ONE", 1],
    ["QUARTER", 0.25],
    ["DIME", 0.10],
    ["NICKEL", 0.05],
    ["PENNY", 0.01]
  ];
  let originalDrawer = JSON.parse(JSON.stringify(cid));
  let updatedDrawer = JSON.parse(JSON.stringify(cid));
  let totalCID = originalDrawer.reduce((sum, [_, amount]) => sum + amount, 0);
  let changeDue = customerChange;

  totalCID = Math.round(totalCID * 100) / 100;

  if (changeDue > totalCID) return { status: "INSUFFICIENT_FUNDS", change: [], updatedDrawer: cid };
  if (Math.abs(changeDue - totalCID) < 0.01) {
    const emptyDrawer = cid.map(([name]) => [name, 0]);

    // Calculate exact change
    let change = [];
    for (let i = DENOMINATIONS.length - 1; i >= 0; i--) {
      const [name, value] = DENOMINATIONS[i];
      let amountInDrawer = cid.find(row => row[0] === name)[1];
      let amountToReturn = 0;

      while (changeDue >= value && amountInDrawer >= value) {
        changeDue -= value;
        amountInDrawer -= value;
        amountToReturn += value;
        changeDue = Math.round(changeDue * 100) / 100;
        amountInDrawer = Math.round(amountInDrawer * 100) / 100;
      }

      if (amountToReturn > 0) {
        change.push([name, Math.round(amountToReturn * 100) / 100]);
      }
    }

    return { status: "CLOSED", change, updatedDrawer: emptyDrawer };
  }

  let change = [];
  const reversedCID = originalDrawer.reverse();
  const reversedUpdatedDrawer = updatedDrawer.reverse();

  for (let i = 0; i < DENOMINATIONS.length; i++) {
    const [name, value] = DENOMINATIONS[i];
    let amountInDrawer = reversedCID[i][1];
    let amountToReturn = 0;

    while (changeDue >= value && amountInDrawer >= value) {
        changeDue -= value;
        amountInDrawer -= value;
        amountToReturn += value;
        changeDue = Math.round(changeDue * 100) / 100;
        amountInDrawer = Math.round(amountInDrawer * 100) / 100;
    }

    reversedUpdatedDrawer[i][1] = Math.round(amountInDrawer * 100) / 100;

    if (amountToReturn > 0) {
      change.push([name, Math.round(amountToReturn * 100) / 100]);
    }
  }

  if (changeDue > 0) return { status: "INSUFFICIENT_FUNDS", change: [], updatedDrawer: cid };
  
  return {
    status: "OPEN",
    change,
    updatedDrawer: reversedUpdatedDrawer.reverse() // Restore original order
  };

}

const updateUI = (result) => {
    let display = `Status: ${result.status}`;
  if (!result) return;

  if (result.status === "OPEN" || result.status === "CLOSED") {
    result.change.forEach(([denomination, amount]) =>
         display += `<p>${denomination}: $${amount}</p>`);
    // Update the drawer display
    updateCID(result.updatedDrawer);
    
    // Optional: update global `cid` so future transactions use updated state
    cid = result.updatedDrawer;
  }
    changeDueElement.innerHTML = display;
};


purchaseBtn.addEventListener("click", () => {
    checkCash(price, Number(cashInput.value), cid);
    cashInput.value = "";
});

cashInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter"){
        checkCash(price, Number(cashInput.value), cid);
        cashInput.value = "";
    }
})

