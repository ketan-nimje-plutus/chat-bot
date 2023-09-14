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
  const [isLoading, setIsLoading] = useState(false);
    const chatContainerRef = useRef(null);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    startChat();
    callChatbotAPI();
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
    // setSelectedOption(null);
  };
  const handleOptionClick = (answer, question) => {
    if (selectedOption) {
      return;
    }
    setSelectedOption(question);

    const selectedOptionMessage = {
      text: question,
      isBot: false,
      timestamp: new Date().toLocaleTimeString(),
    };

    setChatMessages((prevMessages) => [...prevMessages, selectedOptionMessage]);

    scrollToBottom();

    let botResponseShown = false;

    // Show "typing..." message
    const typingMessage = {
      text: 'Typing...',
      isBot: true,
      isOption: false,
      timestamp: new Date().toLocaleTimeString(),
    };
    setChatMessages((prevMessages) => [...prevMessages, typingMessage]);
    scrollToBottom();

    // Delay for 2 seconds before fetching bot response
    setTimeout(() => {
      axios
        .post('https://chat-bot-mongo.onrender.com/get', { question })
        .then((Response) => {
          console.log(Response.data, 'Response');
          const options1 = Response.data.Options;

          // Remove the "typing..." message
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
            setChatMessages((prevMessages) => [...prevMessages, ...optionMessages]);
            console.log(optionMessages, 'optionMessages');
          }

          scrollToBottom();
        })
        .catch((err) => {
          console.log(err, 'err');
        });
    }, 2000); // Wait for 2 seconds before making the bot call
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
    scrollToBottom();
    if (!selectedOption) {
      const updatedMessagesWithTyping = [...newMessages];
      updatedMessagesWithTyping.push({
        text: 'Typing...',
        isBot: true,
        isOption: false,
        timestamp: new Date().toLocaleTimeString(),
      });
      setIsLoading(true);

      setTimeout(() => {
        setIsLoading(false);

        axios.post('https://chat-bot-mongo.onrender.com/get', { question: inputMessage }).then((Response) => {
          console.log(Response.data, 'Response');
          const matchedData = Response.data;
          console.log(matchedData, 'matchedData');
          const updatedMessages = [...updatedMessagesWithTyping.slice(0, -1)];

          if (matchedData) {

            console.log(matchedData?.Botresponse, 'matchedData.answer');
            const botResponseMessage = {
              text: matchedData.Botrespons,
              isBot: true,
              timestamp: new Date().toLocaleTimeString(),
            };
            updatedMessages.push(botResponseMessage);

            if (matchedData.Options && matchedData.Options.length > 0) {
              const optionsMessages = matchedData.Options.map((option) => ({
                text: option.question,
                isBot: true,
                isOption: true,
                onClick: () => handleOptionClick(option.answer, option.question),
              }));
              updatedMessages.push(...optionsMessages);
            }
            if (matchedData?.Botresponse == "I'm sorry, I didn't understand that.") {
              const errorMessage = {
                text: "What are you primarily looking for, from us?",
                isBot: true,
                timestamp: new Date().toLocaleTimeString(),
              };
              updatedMessages.push(errorMessage);
              const defaultOptions = [
                { answer: "Can you tell me little more about what kind of resources you'll want to hire for your project?", question: "Hire dedicated team" }, { answer: "Please Select Frontend Developer or Backend Developer", question: "Start a new project" }, { answer: "Please select your field of job", question: "Apply for Job" }
              ];
              const defaultOptionsMessages = defaultOptions.map((option) => ({
                text: option.question,
                isBot: true,
                isOption: true,
                onClick: () => handleOptionClick(option.answer, option.question),
              }));

              updatedMessages.push(...defaultOptionsMessages);
            }
          } else {
            const errorMessage = {
              text: "What are you primarily looking for, from us?",
              isBot: true,
              timestamp: new Date().toLocaleTimeString(),
            };
            updatedMessages.push(errorMessage);
            const defaultOptions = [
              { answer: "What are you primarily looking for, from us?" },
              { question: "Hire dedicated team" },
              { question: "Start a new project" },
              { question: "Apply for Job" },
            ];
            const defaultOptionsMessages = defaultOptions.map((option) => ({
              text: option.question,
              isBot: true,
              isOption: true,
              onClick: () => handleOptionClick(option.answer, option.question),
            }));

            updatedMessages.push(...defaultOptionsMessages);
          }

          setChatMessages(updatedMessages);
          setSelectedOption(null);
          scrollToBottom();
        }).catch((err) => {
          console.log(err, 'err');
        });
      }, 2000);
    }
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
        <Modal.Header>
          <Modal.Title className='title'>Plutus</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className='chat-box-scroll' ref={chatContainerRef}>

            <div className='message-text'>
              Hi! I am Plutus, your personal assistant to help you with Plutus-related queries
            </div>
            <Image className="Imagesize" src="https://media.licdn.com/dms/image/C511BAQG2JI-OXvO3jA/company-background_10000/0/1565183095196?e=1695272400&v=beta&t=58-Kzic0sPSklRA_gl6l0wtH42jTwpb9EV9I6R0WOaw" alt='img' />
            <div className='chat-messages'>
              {chatMessages?.map((message, index) => (
                <div
                  key={index}
                  className={`chat-message ${message.isBot ? 'left' : 'right'} ${message.isOption ? 'option-message' : ''}`}
                  onClick={message.isOption ? message.onClick : null}
                                  >
                  {message.text && (
                    <div className={`message-text ${message.isOption ? 'message-option' : ''}`}>
{/* {console.log(message.text, 'message.text')} */}
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
