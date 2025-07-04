
import React from 'react';

interface TaggingMenuProps {
  tags: string[];
  chatId: string;
  onSetTag: (chatId: string, tag: string | null) => void;
  onClose: () => void;
  position: { x: number; y: number };
}

const TaggingMenu: React.FC<TaggingMenuProps> = ({ tags, chatId, onSetTag, onClose, position }) => {
  const handleSetTag = (tag: string | null) => {
    onSetTag(chatId, tag);
    onClose();
  };

  return (
    <>
        <div className="fixed inset-0 z-10" onClick={onClose}></div>
        <div 
            className="absolute bg-white rounded-lg shadow-xl border border-gray-200 p-2 z-20 w-48"
            style={{ top: position.y, left: position.x }}
        >
            <p className="text-xs font-bold text-gray-500 uppercase px-2 py-1">Assign Tag</p>
            <ul>
                {tags.map(tag => (
                    <li key={tag}>
                        <button 
                            onClick={() => handleSetTag(tag)}
                            className="w-full text-left px-2 py-1.5 text-sm text-gray-700 hover:bg-brand-pink-100 rounded"
                        >
                            {tag}
                        </button>
                    </li>
                ))}
            </ul>
            <div className="my-1 border-t border-gray-200"></div>
            <button 
                onClick={() => handleSetTag(null)}
                className="w-full text-left px-2 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded"
            >
                Remove Tag
            </button>
        </div>
    </>
  );
};

export default TaggingMenu;
