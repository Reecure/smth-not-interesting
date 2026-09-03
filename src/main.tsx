import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Hub from './components/Hub.tsx'
import Desktop from './components/ShakeGame/Desktop.tsx'
import Mobile from './components/ShakeGame/Mobile.tsx'
import LetterQuest from './components/LetterGame/LetterQuest.tsx'
import LoadingQuest from './components/LoadingQuest/LoadingQuest.tsx'
import './index.css'
import TelegramQuest from "./components/TGQuest/TelegramQuest.tsx";
import StoryQuest from "./components/StoryQuest/StoryQuest.tsx";
import ChatQuest from "./components/ChatQuest/ChatQuest.tsx";

createRoot(document.getElementById('root')!).render(
    <BrowserRouter basename={'smth-not-interesting'}>
        <Routes>
            <Route path="/" element={<Hub />} />
            <Route path="/quest/shake" element={<Desktop />} />
            <Route path="/quest/letter" element={<LetterQuest />} />
            <Route path="/quest/telegram" element={<TelegramQuest />} />
            <Route path="/quest/chat" element={<ChatQuest />} />
            <Route path="/quest/loading" element={<LoadingQuest />} />
            <Route path="/quest/story" element={<StoryQuest />} />
            <Route path="/m/:code" element={<Mobile />} />
        </Routes>
    </BrowserRouter>
)
