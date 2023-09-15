import React, { useRef, useState, useEffect } from 'react';
import { AiOutlineSend } from 'react-icons/ai';
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
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef(null);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  console.log(chatMessages, 'chatMessages');

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

    const updatedOptionData = selectedOptionData.map((option) => {
      return {
        ...option,
        isEnabled: option.question === question,
      };
    });

    // Update the selected option data
    setSelectedOptionData(updatedOptionData);
    const selectedOptionMessage = {
      text: question,
      isBot: false,
      timestamp: new Date().toLocaleTimeString(),
    };

    setChatMessages((prevMessages) => [...prevMessages, selectedOptionMessage]);

    // scrollToBottom();

    let botResponseShown = false;
    const typingMessage = {
      text: 'Typing...',
      isBot: true,
      isOption: false,
      timestamp: new Date().toLocaleTimeString(),
    };

    setChatMessages((prevMessages) => [...prevMessages, typingMessage]);
    // scrollToBottom();
    setTimeout(() => {
      axios
        .post('https://chat-bot-mongo.onrender.com/get', { question })
        .then((Response) => {
          console.log(Response.data, 'Response');
          const options1 = Response.data.Options;
          setChatMessages((prevMessages) => prevMessages.filter((msg) => msg !== typingMessage));

          if (!botResponseShown) {
            botResponseShown = true;
            if (answer) {
              const botResponseMessage = {
                text: answer,
                isBot: true,
                timestamp: new Date().toLocaleTimeString(),
              };
              setChatMessages((prevMessages) => [...prevMessages, botResponseMessage]);
            }
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
            console.log(optionMessages, 'optionMessages');
          }

          scrollToBottom();
        })
        .catch((err) => {
          console.log(err, 'err');
        });
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
    const typingMessage = {
      text: 'Typing...',
      isBot: true,
      isOption: false,
      timestamp: new Date().toLocaleTimeString(),
    };
    setChatMessages((prevMessages) => [...prevMessages, typingMessage]);
    setTimeout(() => {
      axios.post('https://chat-bot-mongo.onrender.com/get', { question: inputMessage }).then((Response) => {
        console.log(Response.data, 'Response');
        const matchedData = Response.data;
        console.log(matchedData, 'matchedData');
        const updatedMessagesWithTyping = [...newMessages, typingMessage]; // Keep "Typing..." message

        if (matchedData) {
          console.log(matchedData?.Botresponse, 'matchedData.answer');
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
            const defaultOptions = [
              { answer: "Can you tell me a little more about what kind of resources you'll want to hire for your project?", question: "Hire a dedicated team" },
              { answer: "Please select Frontend Developer or Backend Developer", question: "Start a new project" },
              { answer: "Please select your field of job", question: "Apply for a Job" }
            ];
            const defaultOptionsMessages = defaultOptions.map((option) => ({
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
          const defaultOptions = [
            { answer: "What are you primarily looking for, from us?" },
            { question: "Hire a dedicated team" },
            { question: "Start a new project" },
            { question: "Apply for a Job" },
          ];
          const defaultOptionsMessages = defaultOptions.map((option) => ({
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
    }, 2000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  const callChatbotAPI = () => {
    console.log("callChatbotAPI", "callChatbotAPIcallChatbotAPI");

    axios.post('https://chat-bot-mongo.onrender.com/get', { question: inputMessage }).then((Response) => {
      console.log(Response.data, 'Response');
      const matchedData = Response.data;
      console.log(matchedData, 'matchedData')
      if (matchedData) {
        const botResponseMessage = {
          text: matchedData.Botresponse,
          isBot: true,
          timestamp: new Date().toLocaleTimeString(),
        };
        setSelectedOptionData(matchedData.Options)
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
      <Modal show={showChat} onHide={hideChat}>
        <Modal.Header closeButton>
          <Modal.Title className='title'>Ask Plutus</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className='chat-box-scroll' ref={chatContainerRef}>
            <div className='message-text'>
              Welcome to <b>Plutus</b>,  Your personal assistant to help you with your queries
            </div>
            <Image className="Imagesize" src="https://media.licdn.com/dms/image/C511BAQG2JI-OXvO3jA/company-background_10000/0/1565183095196?e=1695272400&v=beta&t=58-Kzic0sPSklRA_gl6l0wtH42jTwpb9EV9I6R0WOaw" alt='img' />
            <div className='chat-messages'>
              {chatMessages?.map((message, index) => (
                <div
                  key={index}
                  className={` chat-message ${message.isBot ? 'left' : 'right'} ${message.isOption ? 'option-message' : ''} `}
                  onClick={message.isOption && selectedOptionData.some((option) => option.question === message.text || option.text === message.text) ? message.onClick : null}
                >
                  {message.text && (
                    <div className={`message-text ${message.isOption ? 'message-option' : ''} ${selectedOptionData.some((option) => option.question === message.text || option.text === message.text) ? "Selectoption" : ""}`}>
                      {message.text && message.text}
                    </div>
                  )}
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
