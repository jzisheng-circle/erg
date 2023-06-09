import React, { useState, useEffect } from 'react';
import './App.css';
import axios from 'axios';


/*
npm install axios
npm install react-bootstrap bootstrap
*/
  



function App() {

  const [highBid, setHighBid] = useState([]);
  const [bids, setBids] = useState([]);
  const [name, setName] = useState("");


  useEffect(() => {
    const interval = setInterval(() => {
        axios.get('http://159.223.131.55:5000/getHighestBid')
        .then(response => {
          setHighBid(response.data);
        })
        .catch(error => {
          console.error(error);
        });

      axios.get('http://159.223.131.55:5000/getBids')
        .then(response => {
          setBids(response.data);
        })
        .catch(error => {
          console.error(error);
        });
    }, 1000);
    

      return () => clearInterval(interval);
  }, []);

  const handleSubmit = event => {
    event.preventDefault();

    // get current high bid
    axios.get('http://159.223.131.55:5000/getHighestBid')
    .then(response => {
      setHighBid(response.data);
    })
    .catch(error => {
      console.error(error);
    });

    // POST high bid
    let config = {
      headers: {
        "Content-Type": "application/json",
        'Access-Control-Allow-Origin': '*',
        }
    }
    let data = {"bid": highBid.Price+1, "name": name};
    var url = 'http://159.223.131.55:5000/bid';
    axios.post(url, data, config)
      .then(response => {
        console.log(highBid.Name, name);
        if (highBid.Name == name) {
          
          alert("You are already the highest bidder!");
          throw("already highest bidder");
        }
        if (name.length == 0) {
          alert("Name cannot be empty.");
          throw("name cannot be empty");
        }
        console.log('success');
        
        // refresh bids list
        axios.get('http://159.223.131.55:5000/getBids')
            .then(response => {
              setBids(response.data);
            })
            .catch(error => {
              console.error(error);
            });
        
        // refresh highest bid
        axios.get('http://159.223.131.55:5000/getHighestBid')
          .then(response => {
            setHighBid(response.data);
          })
          .catch(error => {
            console.error(error);
          });

      })
      .catch(error => {
        console.error(error);
      });
  }

  return (
    <div>

    <div class="center2">
      <table class = "center">
        <th>

        <form>
          <label>Name: 
          <input
            type="text" 
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          </label>
        </form>

        </th>

        <th>
        <p>Amount: ${highBid.Price+1}.00</p>
        </th>


        <th>
        
        </th>
      </table>
      <table class = "center2"><button onClick={handleSubmit}>Bid!</button></table>
      
    </div>

    <div class="center2">
    <table class="center">
      <tr>
        <th><h3>Bidder</h3></th> <th><h3>Price</h3></th>
      </tr>
      {bids.map(bid => (
        <tr>
          <th>{bid.Name}</th> <th>${bid.Price}.00</th>
        </tr>
      ))}
    </table>
    </div>

    </div>
  );
}

export default App;
