
import React from 'react';
import { Bot } from '../../types.ts';

interface FarLeftSidebarProps {
    onSelectView: (view: 'chat' | 'gemini' | string) => void;
    currentView: 'chat' | 'gemini' | string;
    bots: Bot[];
    onOpenConfigureBotModal: () => void;
    onOpenFindFriendsModal: () => void;
}

const SidebarIcon: React.FC<{ children: React.ReactNode, active?: boolean, pink?: boolean, onClick?: () => void, tooltip?: string }> = ({ children, active, pink, onClick, tooltip }) => (
    <div onClick={onClick} className={`relative flex items-center justify-center h-12 w-12 my-2 mx-auto rounded-full transition-all duration-300 ease-in-out cursor-pointer group
        ${active 
            ? 'bg-brand-pink-500 text-white rounded-2xl' 
            : pink 
            ? 'bg-brand-pink-100 text-brand-pink-500 hover:bg-brand-pink-500 hover:text-white hover:rounded-2xl' 
            : 'bg-brand-pink-50 text-brand-pink-500 hover:bg-brand-pink-500 hover:text-white hover:rounded-2xl'}`
        }>
        {children}
        <div className={`absolute w-1 h-0 ${active ? 'h-5' : 'group-hover:h-3'} bg-white rounded-r-full left-0 transition-all duration-200`}></div>
        {tooltip && (
            <span className="absolute w-auto p-2 m-2 min-w-max left-14 rounded-md shadow-md text-white bg-gray-900 text-xs font-bold transition-all duration-100 scale-0 origin-left group-hover:scale-100 z-10">
                {tooltip}
            </span>
        )}
    </div>
);

const FarLeftSidebar: React.FC<FarLeftSidebarProps> = ({ onSelectView, currentView, bots, onOpenConfigureBotModal, onOpenFindFriendsModal }) => {
    return (
        <div className="w-20 bg-brand-pink-50 p-2 flex flex-col items-center">
            <SidebarIcon active={currentView === 'chat'} onClick={() => onSelectView('chat')} tooltip="Chats">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            </SidebarIcon>
            <div className="w-8 border-t border-brand-pink-200 mx-auto my-2"></div>

            <SidebarIcon active={currentView === 'gemini'} onClick={() => onSelectView('gemini')} tooltip="Gemini Bot">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 3.5a1.5 1.5 0 013 0V5h1.5a1.5 1.5 0 010 3H13v1.5a1.5 1.5 0 01-3 0V8H8.5a1.5 1.5 0 010-3H10V3.5z" />
                    <path d="M3.5 10a1.5 1.5 0 000 3H5v1.5a1.5 1.5 0 003 0V13h1.5a1.5 1.5 0 000-3H8v-1.5a1.5 1.5 0 00-3 0V10H3.5zM15 11.5a1.5 1.5 0 013 0V13h1.5a1.5 1.5 0 010 3H18v1.5a1.5 1.5 0 01-3 0V16h-1.5a1.5 1.5 0 010-3H15v-1.5z" />
                </svg>
            </SidebarIcon>

            {bots.map(bot => (
                <SidebarIcon key={bot.id} active={currentView === bot.id} onClick={() => onSelectView(bot.id)} tooltip={bot.name}>
                    <img src={bot.avatar} className="h-8 w-8 rounded-full" />
                </SidebarIcon>
            ))}
            
            <SidebarIcon pink onClick={onOpenConfigureBotModal} tooltip="Create Bot">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
            </SidebarIcon>
            <SidebarIcon onClick={onOpenFindFriendsModal} tooltip="Find Friends">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </SidebarIcon>
        </div>
    );
}

export default FarLeftSidebar;
