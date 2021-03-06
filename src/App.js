import React, { useState, useEffect } from 'react';
import './App.css';
import * as firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";
import firebaseConfig from './firebaseConfig';

const wool = {
  white: "white_wool",
  orange: "orange_wool",
  magenta: "magenta_wool",
  lightBlue: "light_blue_wool",
  yellow: "yellow_wool",
  lime: "lime_wool",
  pink: "pink_wool",
  gray: "gray_wool",
  lightGray: "light_gray_wool",
  cyanWool: "cyan_wool",
  purple: "purple_wool",
  blue: "blue_wool",
  brown: "brown_wool",
  green: "green_wool",
  red: "red_wool",
  black: "black_wool",
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

function addFirebase(woolList, user) {
  db.collection("orders").add({
    date: new Date(),
    lana: woolList,
    user,
  }).then(() => {
    console.log("Saved!")
  }).catch((error) => {
    console.error("Error adding: ", error);
  })
}

function getOrdersList() {
  return db.collection("orders").get();
}

function OrdersComponent() {
  const [ orders, setOrders ] = useState([]); 

  useEffect(() => {
    const fetchOrders = async () => {
      const response = await getOrdersList().catch((err) => {
        console.error(err);
      });
      const arr = [];
      response.forEach((doc) => {
        const data = doc.data();
        const id = doc.id;
        arr.push({
          id,
          data,
        });
      });
      setOrders(arr);
    }
    fetchOrders();
  }, []);

  return (
    <div style={{ display: "flex", flexWrap: 'wrap' }}>
      {
        orders.map(({ id, data }) => {
          const removeHandler = () => {
            db.collection("orders").doc(id).delete().then(() => {
              console.log("Borrado")
            }).catch((err) => {
              console.error(err);
              alert('Error, orden no ha sido borrado')
            })
            for (let i = 0; i < orders.length; i += 1) {
              if (orders[i].id === id) {
                const newOrders = [...orders];
                newOrders.splice(i, 1);
                setOrders(newOrders);
              }
            }
          }

          return (
            <div 
              className="shadow" 
              style={{ 
                borderRadius: '10px', 
                width: '200px',
                margin: '10px', 
                padding: '10px',
              }}
              key={id}
            >
              <div style={{ 
                display: 'flex', 
                justifyContent: 'flex-start', 
                position: 'relative'
                }}>
                <span>{`${data.user}`}</span>
                <div> - {new Date(data.date.seconds * 1000).toDateString()}</div>
                <div className="delete" style={{ position: 'absolute', right: 0 }} onClick={removeHandler}>x</div>
              </div>
              <div style={{ paddingTop: '5px' }}>
              {
                  data.lana.map((element) => {
                    return (
                      <span key={element.wool}>
                        <img alt={element.wool} src={require(`./img/${element.wool}.png`)} width={40} height={40}/>
                        <span>{`x${element.amount}`}</span>
                      </span>
                    );
                  })
                }
              </div>
            </div>
          );
        })
      }
    </div>
  );
}

function App() {
  const [ woolCart, setWoolCart ] = useState([]);
  const [ stacks, setStacks ] = useState(1);
  const [ user, setUser ] = useState("");
  const [ selectedWool, setWool ] = useState("white_wool");

  const userHandler = ({ target }) => {
    setUser(target.value);
  }

  const stacksHandler = ({ target }) => {
    setStacks(parseInt(target.value));
  }

  const addToCart = () => {
    const cart = [...woolCart];
    for (let i = 0; i < cart.length; i += 1) {
      if (cart[i].wool === selectedWool) {
        cart[i].amount += stacks;
        setWoolCart(cart);
        return;
      }
    }
    cart.push({ amount: stacks, wool: selectedWool });    
    setWoolCart(cart);
  }
  
  const submitOrder = () => {
    alert('Tu pedido ha sido registrado');
    addFirebase(woolCart, user);
  }

  let total = 0;
  for (let i = 0; i < woolCart.length; i += 1) {
    total += woolCart[i].amount;
  }

  return (
    <div className="App">
      <div className="title">
        Wool.it
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
        <div>
        <div className="add-wool shadow">
        <div className="add-to-cart"> Agregar al carrito </div>
        <div>
          <span className="selection">
          <span>Wool type:</span>
            <select value={selectedWool} onChange={({ target }) => {setWool(target.value)}}>
              {
                Object.entries(wool).map(([ key, text ]) => {
                  return (<option key={text} value={text}>{key}</option>)
                  })
              }
            </select>
          </span>
        </div>
        <img alt={selectedWool} src={require(`./img/${selectedWool}.png`)} width={50} height={50}/>
        <div className="selection">
          <label htmlFor="number">Stacks: </label><input onChange={stacksHandler} value={stacks} type="number" id="number" name="stacks" min="1" />
        </div>

        <button onClick={addToCart}>Add</button>
      </div>    
      <div className="add-wool shadow">
        <div className="add-to-cart">Shopping Cart {`$${Math.ceil(total*0.5)}`}</div>
        <div className="stock">
          {
            woolCart.map((element) => {
              const removeHandler = () => {
                const cart = [...woolCart];
                for (let i = 0; i < cart.length; i += 1) {
                  if (cart[i].wool === element.wool) {
                    cart.splice(i, 1);
                  }
                }
                setWoolCart(cart);
              }
              return (
                <span key={element.wool} className="item" onClick={removeHandler}>
                  <img alt={element.wool} src={require(`./img/${element.wool}.png`)} width={50} height={50}/>
                  <span>{`x${element.amount}`}</span>
                </span>
              );
            })
          }
        </div>
        <div className="selection">
          <label htmlFor="name">User: </label><input onChange={userHandler} value={user} type="text" id="user" name="user" placeholder="Sh1ft" />
        </div>
        <button onClick={submitOrder} style={{ marginTop: "15px" }} disabled={total === 0}>Send</button>
      </div>
      </div>
        <div style={{ padding: '40px', paddingLeft: '60px' }}>
          <OrdersComponent />
        </div>
      </div>
    </div>
  );
}

/*
        
*/
export default App;
