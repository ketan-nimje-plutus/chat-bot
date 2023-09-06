import React, { useRef, useState, useEffect } from 'react';
import { AiOutlinePlus, AiOutlineMinus, AiOutlineSend } from 'react-icons/ai';
import { FaUserAlt } from 'react-icons/fa';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import './ChatBot.css';
import axios from 'axios';
import data from './steps.json'

function Chatbot() {
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [selectedOption, setSelectedOption] = useState(null);
  const chatContainerRef = useRef(null);
  const [responseMessage, setResponseMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [jsonData, setJsonData] = useState([]);

  useEffect(() => {
    setJsonData(data);
  }, []);

  const startChat = () => {
    setShowChat(true);
    const welcomeMessage = {
      text: 'Welcome to the chat!',
      isBot: true,
      timestamp: new Date().toLocaleTimeString(),
    };
    setChatMessages([welcomeMessage]);
  };

  const hideChat = () => {
    setShowChat(false);
    setChatMessages([]);
    setSelectedOption(null);
  };

  const handleOptionClick = (answer, question) => {
    // Display a typing indicator

    const selectedOptionMessage = {
      text: question,
      isBot: false,
      timestamp: new Date().toLocaleTimeString(),
    };
    setChatMessages((prevMessages) => [...prevMessages, selectedOptionMessage]);
    const typingMessage = {
      text: 'Typing...',
      isBot: true,
      isOption: false,
      timestamp: new Date().toLocaleTimeString(),
    };
    setChatMessages((prevMessages) => [...prevMessages, typingMessage]);

    setTimeout(() => {
      const botResponseMessage = {
        text: answer,
        isBot: true,
        isOption: false,
        timestamp: new Date().toLocaleTimeString(),
      };

      setChatMessages((prevMessages) => {
        const updatedMessages = prevMessages
          .filter((message) => message.text !== 'Typing...')
          .concat(botResponseMessage);
        return updatedMessages;
      });
      if (!answer) {
        const selectedOptions =
          jsonData.find((data) => data.question === question)?.option;
        const optionMessages = selectedOptions.map((option) => ({
          text: option.question,
          isBot: true,
          isOption: true,
          onClick: () => handleOptionClick(option.answer, option.question),
        }));
        setChatMessages((prevMessages) => [...prevMessages, ...optionMessages]);
      }
    }, 2000);
  };

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

    const updatedMessagesWithTyping = [...newMessages, isLoading];
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      const matchedData = jsonData.find((data) => data.question === inputMessage);
      if (matchedData) {
        const botResponseMessage = {
          text: matchedData.answer,
          isBot: true,
          timestamp: new Date().toLocaleTimeString(),
        };
        const optionsMessages = matchedData.option.map((option) => ({
          text: option.question,
          isBot: true,
          isOption: true,
          onClick: () => handleOptionClick(option.answer, option.question),
        }));
        const updatedMessages = [
          ...updatedMessagesWithTyping.slice(0, -1),
          botResponseMessage,
          ...optionsMessages,
        ];
        setChatMessages(updatedMessages);
      } else {
        const errorMessage = {
          text: 'Sorry, I couldn\'t find a matching response for your question.',
          isBot: true,
          timestamp: new Date().toLocaleTimeString(),
        };
        const updatedMessages = [...updatedMessagesWithTyping.slice(0, -1), errorMessage];
        setChatMessages(updatedMessages);
      }
      setSelectedOption(null);
    }, 2000);
    scrollToBottom();
  };

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollToBottom = chatContainerRef.current.scrollToTop;
    }
  };
  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  const callChatbotAPI = () => {
    const matchedData = jsonData.find((data) => data.question === inputMessage);

    if (matchedData) {
      const botResponseMessage = {
        text: matchedData.answer,
        isBot: true,
        timestamp: new Date().toLocaleTimeString(),
      };

      const optionsMessages = matchedData.option.map((option) => {
        const optionMessage = {
          text: option.question,
          isBot: true,
          isOption: true,
          onClick: () => handleOptionClick(option.answer, option.question),
        };
        return optionMessage;
      });

      const updatedMessages = [botResponseMessage, ...optionsMessages];
      setChatMessages(updatedMessages);
    } else {
      const errorMessage = {
        text: 'Sorry, I couldn\'t find a matching response for your question.',
        isBot: true,
        timestamp: new Date().toLocaleTimeString(),
      };
      const updatedMessages = [errorMessage];
      setChatMessages(updatedMessages);
    }
  };


  return (
    <div className='icon'>
      <Button
        onClick={showChat ? hideChat : () => {
          startChat();
          callChatbotAPI()
        }}
        style={{ backgroundColor: 'rgb(41, 164, 205)' }}
      >
        <i>
          {showChat ? <AiOutlineMinus /> : <AiOutlinePlus />}
        </i>
      </Button>
      <Modal show={showChat} onHide={hideChat}>
        <Modal.Header closeButton>
          <Modal.Title className='title'>Plutus</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className='message-text'>
            helloo
          </div>
          <div className='chat-messages' ref={chatContainerRef}>
            {chatMessages?.map((message, index) => (
              <div
                key={index}
                className={`chat-message ${message.isBot ? 'left' : 'right'} ${message.isOption ? 'option-message' : ''}`}
                onClick={message.isOption ? message.onClick : null}
              >
                <div className={`message-text ${message.isOption ? 'message-option' : ''}`}>
                  {message.text}
                </div>
                {!message.isOption && (
                  <div className='message-timestamp'>
                    {new Date().toLocaleString('en-US', {
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
                  {/* <div className='message-content'> */}
                  <div className='message-text'>
                    {selectedOption.question}
                    {/* </div> */}
                  </div>
                </div>
                <div className='message-timestamp'>{new Date().toLocaleString('en-US', {
                  hour: 'numeric',
                  minute: 'numeric',
                  hour12: true,
                })}</div>
                <div className='chat-message left'>
                  {/* <div className='message-content'> */}
                  <div className='message-text'>
                    {selectedOption.answer}
                    {/* </div> */}
                  </div>
                </div>
                {selectedOption.options && selectedOption.options.map((option, index) => (
                  <div
                    key={index}
                    className='chat-message left message-option'
                    onClick={option.onClick}
                  >
                    {/* <div className='message-content'> */}
                    <div className={`message-text ${option.isOption ? 'message-option' : ''}`}>
                      {option.question}
                    </div>
                    {/* </div> */}
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
    </div >
  );
}

export default Chatbot;
