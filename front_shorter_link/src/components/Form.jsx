import { useState } from 'react';

function Form() {
    const [inputValue, setInputValue] = useState('');  
    const [shortUrl, setShortUrl] = useState(''); 
    const [copyButtonText, setCopyButtonText] = useState('Copiar');

    const handleSubmit = async (event) => {
        event.preventDefault();

        const formData = new URLSearchParams();
        formData.append('url', inputValue);

        try {
            const response = await fetch('http://127.0.0.1:8080/shorten', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json', 
                },
                body: JSON.stringify({ url: inputValue }), 
            });

            if (!response.ok) {
                throw new Error('No se pudo acortar la URL');
            }

            const shortUrl = await response.text();
            setShortUrl(shortUrl);
        } catch (error) {
            console.error('Error:', error);
            setShortUrl('Error: unable to shorten the URL');
        }
    }
    const handleCopyClick = () => {
        navigator.clipboard.writeText(shortUrl) 
            .then(() => {
                setCopyButtonText('Copied'); 
                setTimeout(() => setCopyButtonText('copy '), 3000); 
                setShortUrl("")
            })
            .catch((err) => console.error('error when copying:', err));
    }

    return (
        <div className=" shadow-2xl shadow-purple-500/50 p-6 border-2 border-gray-300 rounded-lg max-w-4xl mx-auto bg-purple-900">
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label htmlFor="input" className="block text-gray-200 text-sm font-bold mb-2">
                        Input:
                    </label>
                    <input
                        id="input"
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder='Enter url'
                        className="w-full p-2 border border-gray-300 rounded text-center bg-purple-950"
                    />
                </div>
                <div className="mb-4">
                    <button
                        type="submit"
                        className={`font-bold w-1/5 bg-blue-500 text-white py-2 text-center rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 
                                  ${!inputValue && 'bg-slate-500 opacity-60 hover:bg-slate-500 cursor-not-allowed'}`}
                        disabled={!inputValue} 
                    >
                        Send
                    </button>
                </div>
                <div>
                    <label htmlFor="response" className="block text-gray-200 text-sm font-bold mb-2">
                    broken link:
                    </label>
                    <textarea
                        id="response"
                        value={shortUrl} 
                        readOnly
                        className="w-2/3 p-2 text-center border border-gray-400 rounded h-12 resize-none bg-purple-950"
                    />
                    <div>
                    <button
                        type="button"
                        onClick={handleCopyClick}
                        disabled={!shortUrl} 
                        className={`p-1 text-white py-1 px-3 rounded focus:outline-none focus:ring-2 ${shortUrl ? 'bg-green-500 hover:bg-green-700 text-white focus:ring-green-500' : 'bg-gray-400 opacity-60 text-gray-200 cursor-not-allowed'}`}
                        
                    >
                        {copyButtonText}
                    </button>
                    </div>
                </div>
            </form>
        </div>
    )
}

export default Form;
