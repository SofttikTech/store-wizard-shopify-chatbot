import React, { useState, useEffect } from 'react';
import { TextField, Button, Card, Stack } from '@shopify/polaris';

const ChatBot = () => {
    const [script, setScript] = useState('');
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [customerId, setCustomerId] = useState(null);
    const [storeName, setStoreName] = useState('');




    const handleSend = async () => {
        if (message.trim()) {
            setMessages([...messages, { user: 'You', text: message }]);
            setMessage('');
    
            try {
                const ipResponse = await fetch('https://api.ipify.org?format=json');
                const { ip } = await ipResponse.json();
                const response = await fetch(
                    'https://n8n.softtik.com/webhook/755917b9-0121-4543-96f8-cce968ab9e7a/chat',
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ chatInput:message, userIp: ip }), 
                    }
                );
    
                const data = await response.json();    
                const botResponse = data.output || "Bot: I'm not sure how to respond to that.";
                setMessages((prevMessages) => [...prevMessages, { user: 'Bot', text: botResponse }]);
            } catch (error) {
                console.error('Error fetching response from n8n webhook:', error);
                setMessages((prevMessages) => [
                    ...prevMessages,
                    { user: 'Bot', text: 'An error occurred. Please try again later.' },
                ]);
            }
        }
    };
    


    return (
        <div style={styles.container}>
            <Card sectioned>
                {/* <h2>ChatBot</h2> */}

                {/* Script Input Field */}
                <Stack vertical spacing="loose">
                    {/* <TextField
                        label="ChatBot Script"
                        value={script}
                        onChange={(value) => setScript(value)}
                        placeholder="Enter chatbot script logic here..."
                        multiline={4}
                    /> */}

                    {/* Message Display */}
                    <div style={styles.chatBox}>
                        {messages.map((msg, index) => (
                            <div key={index} style={styles.message}>
                                <strong>{msg.user}: </strong>
                                <span>{msg.text}</span>
                            </div>
                        ))}
                    </div>

                    {/* Message Input Field */}
                    <Stack spacing="tight">
                        <TextField
                            label="Your Message"
                            value={message}
                            onChange={(value) => setMessage(value)}
                            placeholder="Type your message..."
                            autoComplete="off"
                        />
                        <div style={{ margin: '23px 10px' }}>
                            <Button onClick={handleSend} primary>

                                Send
                            </Button>
                        </div>

                    </Stack>
                </Stack>
            </Card>
        </div>
    );
};

// Styles
const styles = {
    container: {
        maxWidth: '600px',
        margin: '0 auto',
        padding: '20px',
        fontFamily: 'Arial, sans-serif',
    },
    chatBox: {
        border: '1px solid #ccc',
        borderRadius: '5px',
        padding: '10px',
        height: '200px',
        overflowY: 'auto',
        marginTop: '10px',
    },
    message: {
        marginBottom: '10px',
    },
};

export default ChatBot;
