import React, { useRef, useState, useEffect } from 'react';
import { AiOutlinePlus, AiOutlineMinus, AiOutlineSend } from 'react-icons/ai';
import { FaUserAlt } from 'react-icons/fa';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import './ChatBot.css';
import axios from 'axios';

function Chatbot() {
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [selectedOption, setSelectedOption] = useState(null);
  const chatContainerRef = useRef(null);
  const [responseMessage, setResponseMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const startChat = () => {
    setShowChat(true);
  };
  const hideChat = () => {
    setShowChat(false);
    setChatMessages([]);
    setSelectedOption(null);
  };
  const handleOptionClick = (answer, question) => {
    const selectedOptionMessage = {
      text: question,
      isBot: false,
      timestamp: new Date().toLocaleTimeString(),
    };
    setChatMessages((prevMessages) => [...prevMessages, selectedOptionMessage]);
    const typingMessage = {
      text: 'Typing...',
      isBot: true,
      timestamp: new Date().toLocaleTimeString(),
    };
    setChatMessages((prevMessages) => [...prevMessages, typingMessage]);
    setTimeout(() => {
      const botResponseMessage = {
        text: answer,
        isBot: true,
        timestamp: new Date().toLocaleTimeString(),
      };
      setChatMessages((prevMessages) => {
        const typingIndex = prevMessages.findIndex(
          (message) => message.text === 'Typing...'
        );
        if (typingIndex !== -1) {
          const updatedMessages = [
            ...prevMessages.slice(0, typingIndex),
            botResponseMessage,
            ...prevMessages.slice(typingIndex + 1),
          ];

          return updatedMessages;
        }
        return prevMessages;
      });
    }, 2000);
  };
  // const simulateTypings = (text) => {
  //   const typingDelay = 10;
  //   let currentIndex = 0;
  //   const typingInterval = setInterval(() => {
  //     setChatMessages((prevAnswer) => prevAnswer + text[currentIndex]);
  //     currentIndex++;
  //     if (currentIndex === text.length) {
  //       clearInterval(typingInterval);
  //       setIsLoading(false);
  //     }
  //   }, typingDelay);
  // }
  const sendMessage = () => {
    if (inputMessage.trim() === '') return;
    const newUserMessage = {
      text: inputMessage,
      isBot: false,
      timestamp: new Date().toLocaleTimeString(),
    };

    const newMessages = [...chatMessages, newUserMessage];
    setChatMessages(newMessages);
    setInputMessage('');
    // const typingMessage = {
    //   text: 'Typing...',
    //   isBot: true,
    //   timestamp: new Date().toLocaleTimeString(),
    // };
    const updatedMessagesWithTyping = [...newMessages, isLoading];
    // setChatMessages(updatedMessagesWithTyping);

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      axios
        .post('http://localhost:9090/get', { question: inputMessage })
        .then((response) => {
          const botResponse = response.data;
          scrollToBottom(); 
          const botResponseMessage = {
            text: botResponse.Botresponse,
            isBot: true,
            timestamp: new Date().toLocaleTimeString(),
          };
          const optionsMessages = Array.isArray(botResponse.Options)
            ? botResponse.Options.map((option) => ({
              text: option.question,
              isBot: true,
              isOption: true,
              onClick: () => handleOptionClick(option.answer, option.question),
            }))
            : [];
          const updatedMessages = [
            ...updatedMessagesWithTyping.slice(0, -1),
            botResponseMessage,
            ...optionsMessages,
          ];
          setChatMessages(updatedMessages);
        })
        .catch((error) => {
          console.error('Error sending message:', error);
        });
      setSelectedOption(null);
    }, 2000);
    scrollToBottom();
  };

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom(); // Scroll to the bottom when chatMessages change
  }, [chatMessages]);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    
    }
  };

  const callChatbotAPI = () => {
    axios
      .post('http://localhost:9090/get', { question: inputMessage })
      .then(response => {
        const botResponse = response.data;
        console.log(botResponse.job,'botResponse')
        const botResponseMessage = { text: botResponse.Botresponse, isBot: true };
        console.log(botResponseMessage,'botResponseMessage')
        const optionsMessages = Array.isArray(botResponse.Options)
          ? botResponse.Options.map(option => {
            const optionMessage = {
              text: option.question,
              isBot: true,  
              isOption: true
            };
  
            if (option.answer) {
              optionMessage.onClick = () => handleOptionClick(option.answer, option.question);
            }
            else if (botResponse.answer){
              optionMessage.onClick = () => handleOptionClick(botResponse.answer, option.question);
            }
  
            return optionMessage;
          })
          : [];
        const updatedMessages = [
          botResponseMessage,
          ...optionsMessages
        ];
        setChatMessages(updatedMessages);
      })
      .catch(error => {
        console.error('Error sending message:', error);
      });
  };
  



  return (
    <div className='icon'>
      <Button
        onClick={showChat ? hideChat : () => {
          startChat();
          callChatbotAPI()
        }}
        style={{ backgroundColor: '#f05454' }}
      >
        <i>
          {showChat ? <AiOutlineMinus /> : <AiOutlinePlus />}
        </i>
      </Button>
      <Modal show={showChat} onHide={hideChat}>
        <Modal.Header closeButton>
          <Modal.Title className='title'>BotChat</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className='chat-messages' ref={chatContainerRef}>
            {chatMessages?.map((message, index) => (
              <div
                key={index}
                className={`chat-message ${message.isBot ? 'left' : 'right'} ${message.isOption ? 'option-message' : ''
                  }`}
                onClick={message.isOption ? message.onClick : null}
              >
                <div className='message-content'>
                  <div className='message-text'>{message.text}</div>
                </div>
                {!message.isOption && (
                  <div className='message-timestamp'>
                    {new Date().toLocaleString('en-US', {
                      // month: 'short',
                      // day: 'numeric',
                      hour: 'numeric',
                      minute: 'numeric',
                      hour12: true,
                    })}
                  </div>
                )}
              </div>
            ))}
            {selectedOption && (
              <>
                <div className='chat-message right'>
                  <div className='message-content'>
                    <div className='message-text'>
                      {selectedOption.question}
                    </div>
                  </div>
                </div>
                <div className='message-timestamp'>{new Date().toLocaleString('en-US', {
                  // month: 'short',
                  // day: 'numeric',
                  hour: 'numeric',
                  minute: 'numeric',
                  hour12: true,
                })}</div>
                <div className='chat-message left'>
                  <div className='message-content'>
                    <div className='message-text'>
                      {selectedOption.answer}
                    </div>
                  </div>
                </div>
                {selectedOption.options && selectedOption.options.map((option, index) => (
                  <div
                    key={index}
                    className='chat-message left option-message'
                    onClick={option.onClick}
                  >
                    <div className='message-content'>
                      <div className='message-text'>
                        {option.question}
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>

          {isLoading ? (
            <div className="dot-loader">
              <p>Typing</p>
              <div className="dot"></div>
              <div className="dot"></div>
              <div className="dot"></div>
            </div>
          ) : null}
        </Modal.Body>

        <div className='chat-input'>
          <input
            className="input"
            type='text'
            placeholder='Type your message...'
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
          />
          <button className='send-button' onClick={sendMessage} disabled={isLoading}>
            <AiOutlineSend size={"1.7em"} />
          </button>
        </div>
      </Modal>
    </div>
  );
}

export default Chatbot;
