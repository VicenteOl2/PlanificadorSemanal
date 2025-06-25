import React, { useState } from "react";
import Calendar from "react-calendar";
import 'react-calendar/dist/Calendar.css';

const CalendarPage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  return (
    <div style={{ maxWidth: 500, margin: "2rem auto" }}>
      <h2 style={{ textAlign: "center" }}>Calendario</h2>
      <Calendar
        onClickDay={date => setSelectedDate(date)}
        value={selectedDate}
      />
      {selectedDate && (
        <DayDetailPage date={selectedDate} />
      )}
    </div>
  );
};

// Componente para mostrar los eventos del día seleccionado
const DayDetailPage: React.FC<{ date: Date }> = ({ date }) => {
  // Aquí puedes conectar con tu base de datos o estado global para mostrar/agregar eventos
  return (
    <div style={{ marginTop: "2rem", padding: "1rem", background: "#f5f5f5", borderRadius: 8 }}>
      <h3>Eventos para {date.toLocaleDateString()}</h3>
      {/* Aquí iría la lista de eventos y el formulario para agregar/quitar */}
      <p>(Aquí puedes mostrar y agregar eventos para este día)</p>
    </div>
  );
};

export default CalendarPage;