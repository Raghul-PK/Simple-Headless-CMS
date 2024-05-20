import React, { createContext, useState } from 'react';

export const MyContext = createContext();

export const MyProvider = ({ children }) => {
    const [selectedEntity, setSelectedEntity] = useState('');

    return (
        <MyContext.Provider value={{ selectedEntity, setSelectedEntity }}>
            {children}
        </MyContext.Provider>
    );
};
