const user = JSON.parse(localStorage.getItem("profile"));

export const initialState = {
  items: [
    { itemName: "", unitPrice: "", quantity: "", discount: "", person: "" },
  ],
  total: 0,
  notes: "",
  rates: "",
  vat: 0,
  currency: "",
  invoiceNumber: Math.floor(Math.random() * 100000),
  status: "",
  type: "Invoice",
  creator: "",
};
