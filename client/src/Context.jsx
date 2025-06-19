import { createContext, useContext, useState, useEffect } from "react";

const Ctx = createContext();
export const useApp = () => useContext(Ctx);

export default function Provider({ children }) {
  const [cart, setCart] = useState([]);
  const [token, setTokenState] = useState(localStorage.getItem("token") || "");

  const setToken = (value) => {
    setTokenState(value);
    if (value) {
      localStorage.setItem("token", value);
    } else {
      localStorage.removeItem("token");
    }
  };

  const logout = () => {
    setToken("");
  };

  const add = (p) => setCart([...cart, p]);
  const remove = (productToRemove) => {
    const index = cart.findIndex((item) => item.id === productToRemove.id);
    if (index !== -1) {
      const newCart = [...cart];
      newCart.splice(index, 1);
      setCart(newCart);
    }
  };

  return (
    <Ctx.Provider value={{ cart, setCart, token, setToken, add, remove, logout }}>
      {children}
    </Ctx.Provider>
  );
}
