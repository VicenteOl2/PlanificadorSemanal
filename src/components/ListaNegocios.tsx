import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { Link } from "react-router-dom";



const ListaNegocios: React.FC = () => {
  const [negocios, setNegocios] = useState<any[]>([]);

  useEffect(() => {
    const fetchNegocios = async () => {
      const querySnapshot = await getDocs(collection(db, "Negocios"));
      setNegocios(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchNegocios();
  }, []);

  return (
    
    <div>
      <h2>Negocios disponibles</h2>
      <ul>
        {negocios.map(negocio => (
          <li key={negocio.id}>
      <Link to={`/negocio/${negocio.id}`}>
        <strong>{negocio.Nombre}</strong>
      </Link>
    </li>
        ))}
      </ul>
    </div>
  );
};

export default ListaNegocios;