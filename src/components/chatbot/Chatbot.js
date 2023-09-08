import React, { useRef, useState, useEffect } from 'react';
import { AiOutlinePlus, AiOutlineMinus, AiOutlineSend } from 'react-icons/ai';
import Modal from 'react-bootstrap/Modal';
import './ChatBot.css';
import data from './steps.json'

function Chatbot() {
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [selectedOption, setSelectedOption] = useState(null);
  const [responseMessage, setResponseMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [jsonData, setJsonData] = useState(data);
  const chatContainerRef = useRef(null);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    startChat()
    callChatbotAPI()
    scrollToBottom();
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
    setSelectedOption(question);
    const selectedOptionMessage = {
      text: question,
      isBot: false,
      timestamp: new Date().toLocaleTimeString(),
    };
  
    setChatMessages((prevMessages) => [...prevMessages, selectedOptionMessage]);
  
    setTimeout(() => {
      setChatMessages((prevMessages) => {
        const typingMessage = {
          text: 'Typing...',
          isBot: true,
          isOption: false,
          timestamp: new Date().toLocaleTimeString(),
        };
        return [...prevMessages, typingMessage];
      });
      scrollToBottom();
  
      setTimeout(() => {
        setChatMessages((prevMessages) => {
          const messagesToUpdate = [...prevMessages];
          const typingMessageIndex = messagesToUpdate.findIndex(
            (message) => message.text === 'Typing...'
          );
  
          if (typingMessageIndex >= 0) {
            messagesToUpdate.splice(typingMessageIndex, 1);
            if (answer === null || answer === '') {
              const emptySpaceMessage = {
                text: '',
                isBot: true,
                isOption: false,
                timestamp: new Date().toLocaleTimeString(),
              };
              messagesToUpdate.push(emptySpaceMessage);
            } else {
              const botResponseMessage = {
                text: answer,
                isBot: true,
                isOption: false,
                timestamp: new Date().toLocaleTimeString(),
              };
              messagesToUpdate.push(botResponseMessage);
            }
  
            const selectedOptions =
              jsonData.find((data) => data.question === question)?.option;
            if (selectedOptions) {
              const optionMessages = selectedOptions.map((option) => ({
                text: option.question,
                isBot: true,
                isOption: true,
                onClick: () => handleOptionClick(option.answer, option.question),
              }));
              messagesToUpdate.push(...optionMessages);
            }
  
            return messagesToUpdate;
          }
  
          return prevMessages;
        });
        scrollToBottom();
      }, 2000);
    }, 0); 
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
        console.log(updatedMessages, 'updatedMessages123456789-');
        setChatMessages(updatedMessages);
        scrollToBottom();
      } else {
        const errorMessage = {
          text: 'Sorry, I couldn\'t find a matching response for your question.',
          isBot: true,
          timestamp: new Date().toLocaleTimeString(),
        };
        const updatedMessages = [...updatedMessagesWithTyping.slice(0, -1), errorMessage];
        console.log(updatedMessages, 'update1233456');
        setChatMessages(updatedMessages);
      }
      setSelectedOption(null);
    }, 2000);
    scrollToBottom();
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  const callChatbotAPI = () => {
    console.log("callChatbotAPI", "callChatbotAPIcallChatbotAPI")
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
      console.log(updatedMessages, 'updatedMessages13,')
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
      <Modal show={showChat} onHide={hideChat}>
        <Modal.Header>
          <Modal.Title className='title'>Plutus</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className='message-text'>
            Hi! I am Plutus, your personal assistant to help you with Plutus-related queries
          </div>
          <div className='chat-messages' ref={chatContainerRef}>
            {chatMessages?.map((message, index) => (
              <div
                key={index}
                className={`chat-message ${message.isBot ? 'left' : 'right'} ${message.isOption ? 'option-message' : ''}`}
                onClick={message.isOption ? message.onClick : null}
              >
               {message.text&& <div className={`message-text ${message.isOption ? 'message-option' : ''}`}>
                  {console.log(message.text, 'message.text')}
                  {message.text&& message.text}
                </div>} 
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
          </div>

          {isLoading ? (
              <p className='typingbox'>Typing...</p>
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
