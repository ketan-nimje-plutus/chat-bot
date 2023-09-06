import React from 'react';
import { Container } from 'react-bootstrap';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import './App.css';
import Chatbot from './components/chatbot/Chatbot';

const App = () => {
  return (
    <Router>
      <main className=".bg-light">
        <Container>
          <div className="bot">
            <Route path="/" component={Chatbot} exact />
          </div>
        </Container>
      </main>
    </Router>
  );
}

export default App;