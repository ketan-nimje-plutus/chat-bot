import React, { useRef, useState, useEffect } from 'react';
import { AiOutlineSend } from 'react-icons/ai';
import { FaTimes } from 'react-icons/fa';
import Modal from 'react-bootstrap/Modal';
import './ChatBot.css';
import axios from 'axios';
import { Image } from 'react-bootstrap';

function Chatbot() {
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [selectedOption, setSelectedOption] = useState(null);
  const [selectedOptionData, setSelectedOptionData] = useState([]);
  // const [firstData, setFirstData] = useState([]);
  // const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef(null);
  let isFirstMessage = true;

  const NewFirstData = JSON.parse(localStorage.getItem('FirstData'))
  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    startChat();
    callChatbotAPI();

  }, []);

  useEffect(() => {
    if (chatMessages) {
      scrollToBottom();
    }
  }, [chatMessages])


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
  };

  const handleOptionClick = (answer, question) => {
    if (selectedOption) {
      return;
    }
    setSelectedOption(question);

    const updatedOptionData = selectedOptionData.map((option) => ({
      ...option,
      isEnabled: option.question === question,
    }));
    setSelectedOptionData(updatedOptionData);

    const selectedOptionMessage = {
      text: question,
      isBot: false,
      timestamp: new Date().toLocaleTimeString(),
    };

    setChatMessages((prevMessages) => [...prevMessages, selectedOptionMessage]);

    // Show typing indicator immediately
    const typingMessage = {
      text: (
        <div className='dot-loader'>
          <p className='typingbox'>Typing</p>
          <div className='dot'></div>
          <div className='dot'></div>
          <div className='dot'></div>
        </div>
      ),
      isBot: true,
      isOption: false,
      timestamp: new Date().toLocaleTimeString(),
    };

    setChatMessages((prevMessages) => [...prevMessages, typingMessage]);

    axios
      .post('https://chat-bot-mongo.onrender.com/get', { question })
      .then((Response) => {
        const options1 = Response.data.Options;
        setChatMessages((prevMessages) =>
          prevMessages.filter((msg) => msg !== typingMessage)
        );

        if (answer) {
          const botResponseMessage = {
            text: answer,
            isBot: true,
            timestamp: new Date().toLocaleTimeString(),
          };

          setChatMessages((prevMessages) => [...prevMessages, botResponseMessage]);
        }

        if (options1 && options1.length > 0) {
          const optionMessages = options1.map((option) => ({
            text: option.question,
            isBot: true,
            isOption: true,
            onClick: () => handleOptionClick(option.answer, option.question),
          }));
          setSelectedOptionData(optionMessages);
          setChatMessages((prevMessages) => [...prevMessages, ...optionMessages]);
        }

        if (answer && options1.length === 0) {
          const FirstAnswer = {
            text: NewFirstData.Botresponse,
            isBot: true,
          };

          // Set the flag to hide the timestamp for the first message
          FirstAnswer.hideTimestamp = true;

          setChatMessages((prevMessages) => [...prevMessages, FirstAnswer]);
          const FirstData = NewFirstData.Options.map((option) => ({
            text: option.question,
            isBot: true,
            isOption: true,
            onClick: () => handleOptionClick(option.answer, option.question),
          }));

          setSelectedOptionData(FirstData);

          // Set the flag to hide the timestamp for all messages in FirstData
          const FirstDataWithTimestampFlag = FirstData.map((message) => ({
            ...message,
            hideTimestamp: true,
          }));

          setChatMessages((prevMessages) => [...prevMessages, ...FirstDataWithTimestampFlag]);
        }

        scrollToBottom();
      })
      .catch((err) => {
        console.log(err, 'err');
      });
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
    const typingMessage = {
      text: (
        <div className='dot-loader'>
          <p className='typingbox'>Typing</p>
          <div className='dot'></div>
          <div className='dot'></div>
          <div className='dot'></div>
        </div>
      ),
      isBot: true,
      isOption: false,
      timestamp: new Date().toLocaleTimeString(),
    };
    setChatMessages((prevMessages) => [...prevMessages, typingMessage]);
    axios.post('https://chat-bot-mongo.onrender.com/get', { question: inputMessage }).then((Response) => {
      const matchedData = Response.data;

      const updatedMessagesWithTyping = [...newMessages, typingMessage];
      if (matchedData) {
        const botResponseMessage = {
          text: matchedData.Botresponse,
          isBot: true,
          timestamp: new Date().toLocaleTimeString(),
        };
        updatedMessagesWithTyping.push(botResponseMessage);
        if (matchedData.Options && matchedData.Options.length > 0) {
          const optionsMessages = matchedData.Options.map((option) => ({
            text: option.question,
            isBot: true,
            isOption: true,
            onClick: () => handleOptionClick(option.answer, option.question),
          }));
          updatedMessagesWithTyping.push(...optionsMessages);
        }
        if (matchedData?.Botresponse === "I'm sorry, I didn't understand that.") {
          const errorMessage = {
            text: "What are you primarily looking for, from us?",
            isBot: true,
            timestamp: new Date().toLocaleTimeString(),
          };
          updatedMessagesWithTyping.push(errorMessage);
          const defaultOptionsMessages = NewFirstData.map((option) => ({
            text: option.question,
            isBot: true,
            isOption: true,
            onClick: () => handleOptionClick(option.answer, option.question),
          }));
          updatedMessagesWithTyping.push(...defaultOptionsMessages);
        }
      } else {
        const errorMessage = {
          text: "What are you primarily looking for, from us?",
          isBot: true,
          timestamp: new Date().toLocaleTimeString(),
        };
        updatedMessagesWithTyping.push(errorMessage);
        const defaultOptionsMessages = NewFirstData.map((option) => ({
          text: option.question,
          isBot: true,
          isOption: true,
          onClick: () => handleOptionClick(option.answer, option.question),
        }));
        updatedMessagesWithTyping.push(...defaultOptionsMessages);
      }
      setChatMessages(updatedMessagesWithTyping);
      setSelectedOption(null);
    }).catch((err) => {
      console.log(err, 'err');
    });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  const callChatbotAPI = () => {
    axios.post('https://chat-bot-mongo.onrender.com/get', { question: inputMessage }).then((Response) => {
      const matchedData = Response.data;
      if (matchedData) {
        const botResponseMessage = {
          text: matchedData.Botresponse,
          isBot: true,
          timestamp: new Date().toLocaleTimeString(),
        };


        setSelectedOptionData(matchedData.Options)
        // setFirstData(matchedData.Options)
        localStorage.setItem('FirstData', JSON.stringify(matchedData));
        if (matchedData.Options && matchedData.Options.length > 0) {
          const optionsMessages = matchedData.Options.map((option) => ({
            text: option.question,
            isBot: true,
            isOption: true,
            onClick: () => handleOptionClick(option.answer, option.question),
          }));
          const updatedMessages = [botResponseMessage, ...optionsMessages];
          setChatMessages(updatedMessages);
        } else {
          setChatMessages([botResponseMessage]);
        }
      } else {
        const errorMessage = {
          text: 'Sorry, I couldn\'t find a matching response for your question.',
          isBot: true,
          timestamp: new Date().toLocaleTimeString(),
        };

        setChatMessages([errorMessage]);
      }
    }).catch((err) => {
      console.log(err, 'err');
    });
  };


  return (
    <div className='icon'>
      <Modal show={showChat} onHide={hideChat} >
        <Modal.Header >
          <Modal.Title className='title'>Ask Plutus</Modal.Title>
          <button className="close-button closeChatbot" onClick={hideChat}>
            {/* <FaTimes size={20} /> */}
            <i class="fa fa-times" aria-hidden="true"></i>
          </button>
        </Modal.Header>
        <Modal.Body>
          <div className='chat-box-scroll' ref={chatContainerRef}>
            <div className='message-text Title-text'>
              Welcome to <b>Plutus</b>, Your personal assistant to help you with your queries
            </div>
            <Image className="Imagesize" src="https://web.plutustec.com/image/Plutus-logo.png" alt='img' />
            <div className='chat-messages'>
              {chatMessages?.map((message, index) => (
                <div
                  key={index}
                  className={`chat-message ${message.isBot ? 'left' : 'right'} ${message.isOption ? 'option-message' : ''}`}
                  onClick={message.isOption && selectedOptionData.some((option) => option.question === message.text || option.text === message.text) ? message.onClick : null}
                >
                  {typeof message.text === 'string' ? (
                    <div className={`message-text ${message.isOption ? 'message-option' : ''} ${selectedOptionData.some((option) => option.question === message.text || option.text === message.text) ? "Selectoption" : ""}`}>
                      <div className="LinkClass" dangerouslySetInnerHTML={{ __html: message.text }} />
                    </div>
                  ) : (
                    <div className={`message-text ${message.isOption ? 'message-option' : ''} ${selectedOptionData.some((option) => option.question === message.text || option.text === message.text) ? "Selectoption" : ""}`}>
                      {message.text && message.text}
                    </div>
                  )}

                  {!message.hideTimestamp && isFirstMessage && !message.isOption && (
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
          </div>
        </Modal.Body>
        {/* 
          <div className='chat-input'>
            <input
              className="input"
              type='text'
              placeholder='Type your message...'
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading} */}
        {/* /> */}
        {/* <button className='send-button'  disabled={isLoading}> */}
        {/* <button className='send-button' onClick={sendMessage} disabled={isLoading}>
              <AiOutlineSend size={"1.7em"} />
            </button> */}
        {/* </div> */}
      </Modal>
    </div>
  );
}

export default Chatbot;
