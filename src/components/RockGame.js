import React from 'react'
import { useState, useEffect } from 'react'
import { GoogleGenerativeAI } from "@google/generative-ai";
import { HarmBlockThreshold, HarmCategory } from "@google/generative-ai";
import prompt_txt from '../components/init_prompt.txt';
import config from '../API_KEY';

const RockGame = () => {
    const generationConfig  = {
        responseMimeType: "application/json",
    }
    const safetySettings = [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
      ];
      
    const genAI = new GoogleGenerativeAI(config.GOOGLE_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash", safetySettings});
    let [chat, setChat] = useState(null)

    let [prev, setPrev] = useState(['Rock'])
    let [curr, setCurr] = useState([])
    let [emoji, setEmoji] = useState(['🗿'])
    let [prevEmoji, setPrevEmoji] = useState([''])
    let [inProgress, setInProgress] = useState(true)
    let [lost, setLost] = useState(true)
    let [comment, setComment] = useState('')
    let [items, setItems] = useState(['rock'])
    let [count, setCount] = useState(0)

    let sendPrompt = async (e) => {
        e.preventDefault()
        let prompt = e.target.prompt_msg.value.trim()
        if (prompt === ''){
            alert('Empty value')
            return
        }
        if (items.includes(prompt.toLowerCase())){
            alert(`You already guessed ${prompt}`)
            return
        }
        const result = await chat.sendMessage(`<next>${prompt}</next>,\n<prev>${prev}</prev>`);
        const response = await result.response;
        const text = response.text();
        try {
            let json = JSON.parse(text)
            setLost(json['if_beats'])
            setComment(json['comment'])
            setPrevEmoji(emoji)
            setEmoji(json['emoji'])
            setCurr(json['item'])
            setItems([...items, json['item'].toLowerCase()])
            if (json['if_beats']){
                setCount(count + 1)
            }
            
        } catch (error){
            alert('AI failure')
        }
        setInProgress(false)
    }

    async function getPrompt(){
        return fetch(prompt_txt)
            .then((res) => res.text())
            .then((text) => {
                return(text);
            })
        .catch((e) => console.error(e));
    }

    async function aiRun() {
        const prompt = await getPrompt()
        let newChat = model.startChat({
            generationConfig,
        });
        setChat(newChat)

        const result = await newChat.sendMessage(prompt);
        const response = await result.response;
        const text = response.text();
    }

    useEffect(() =>{
        // Gemini api loading and first prompt
        aiRun();        
    }, [])
    
    let GameContent = () => {
        return (
            <div className='game_content flex flex-col m-10'>
                <div className='flex items-center justify-center text-slate-100 p-5 text-3xl text-center'>
                    What beats <br/>
                    {prev}?
                </div>
                <div className='flex text-9xl justify-center p-5'>
                    {emoji}
                </div>
                <div className='game_form p-5 pt-8'>
                    <form onSubmit={sendPrompt}>
                        <input type='text' id='prompt' name='prompt_msg' autoFocus autoComplete="off" className='pl-4 py-4 text-lg border border-black'/>
                        <button type='submit' className='p-4 border border-black text-lg bg-green-700'>GO</button>
                    </form>
                </div>
            </div>
            
        )
    }

    let handleNext = () => {
        setPrev(curr)
        setInProgress(true)
    }

    let GameResult = () => {
        if (!lost){
            return (
                <div className='flex flex-col m-10 items-center justify-center text-slate-100 p-5 text-3xl text-center'>

                        <div>{curr}</div>
                        <div className='text-red-500 p-2'>deos not beats</div>
                        <div>{prev}</div>
                        <div className='flex text-7xl justify-center p-5'>{emoji} <div className='text-5xl'>👊</div> {prevEmoji}</div>
                        <div className='text-lg'>{comment}</div>

                    <button onClick={() => window.location.reload()} className='mt-4 border p-3 hover:bg-gray-300 hover:text-gray-700 transition duration-150'>Try again?</button>
                </div>
            )
        }else{
            return (                
                <div className='flex flex-col m-10 items-center justify-center text-slate-100 p-5 text-3xl text-cen'>
                    
                        <div>{curr}</div>
                        <div className='text-green-500 p-2'>beats</div>
                        <div>{prev}</div>
                        <div className='flex text-7xl justify-center p-5'>{emoji} <div className='text-5xl'>👊</div> {prevEmoji}</div>
                        <div className='text-lg'>{comment}</div>
                    
                    <button onClick={handleNext} className='mt-4 border p-3 hover:bg-gray-300 hover:text-gray-700 transition duration-150'>Next</button>
                </div>
            )
        }
    }

    return (
    <div className='RockGame'>
        {count > 0 ? <div className='flex justify-center text-5xl text-purple-600'>
            {count}
        </div> : 
        <div></div>}
        {inProgress ? <GameContent /> : <GameResult />}
        <div className='text-center text-gray-500'>Already guessed:</div>
        {items.length > 1 ? 
        <div className=' text-gray-500 list-none h-50 overflow-y-scroll w-100'>
                {items.map((item, i) => (
                <li key={i}>👊{item}</li>
            ))}
        </div>
        :
         <div>

         </div>
        }
    </div>
  )
}

export default RockGame