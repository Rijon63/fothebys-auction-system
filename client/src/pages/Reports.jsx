import { useEffect, useState } from "react";
import axios from "axios";
import "../assets/reports.css";

export default function Reports() {
  const [sales, setSales] = useState([]);
  const [clients, setClients] = useState([]);
  const [auctions, setAuctions] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:8081/api/reports/sales").then(res => setSales(res.data));
    axios.get("http://localhost:8081/api/reports/clients").then(res => setClients(res.data));
    axios.get("http://localhost:8081/api/reports/auctions").then(res => setAuctions(res.data));
  }, []);

  return (
    <div className="reports-wrapper">
      <h2>Admin Reports</h2>

      <h3>Sales Report</h3>
      {sales.map(sale => (
        <div key={sale._id} className="sale-card">
          <p><strong>Lot:</strong> {sale.title}</p>
          <p><strong>Sold for:</strong> £{sale.salePrice}</p>
          <p><strong>Estimated Price:</strong> £{sale.estimatedPrice}</p>
          <p><strong>Commission (10%):</strong> £{sale.salePrice ? (sale.salePrice * 0.10).toFixed(2) : "N/A"}</p>
        </div>
      ))}

      <h3>Clients</h3>
      {clients.map(c => (
        <div key={c._id} className="client-card">
          <p>{c.fullName} ({c.type})</p>
        </div>
      ))}

<h3>Auctions</h3>
{auctions.map(a => (
  <div key={a._id} className="auction-card">
    <p><strong>Title:</strong> {a.title}</p>
    <p><strong>Status:</strong> {a.salePrice ? `Sold for £${a.salePrice}` : "Available"}</p>
    {a.salePrice && (
      <>
        <p><strong>Buyer:</strong> {a.buyerId?.fullName}</p>
        <p><strong>Email:</strong> {a.buyerId?.email}</p>
      </>
    )}
  </div>
))}

    </div>
  );
}
