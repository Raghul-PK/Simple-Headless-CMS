import React, { useState, useEffect } from 'react';
import { MyContext } from '../MyContext';
import axios from 'axios';

const EntityOps = () => {
    const { selectedEntity } = React.useContext(MyContext);
    const [entityData, setEntityData] = useState([]);
    const [entityAttributes, setEntityAttributes] = useState([]);
    const [newEntry, setNewEntry] = useState({});

    useEffect(() => {
        handleReadData();
        handleReadAttributes();
    }, [selectedEntity]);

    const handleReadData = () => {
        axios.get(`http://localhost:5000/read/${selectedEntity}`)
            .then(res => setEntityData(res.data))
            .catch(err => console.error('Error reading data:', err));
    };

    const handleReadAttributes = () => {
        axios.get(`http://localhost:5000/attributes/${selectedEntity}`)
            .then(res => setEntityAttributes(res.data))
            .catch(err => console.error('Error fetching attributes:', err));
    };

    const handleCreateData = () => {
        if (!validateMandatoryFields()) {
            alert('Please fill in all mandatory fields.');
            return;
        }

        const dataWithNulls = fillOptionalFieldsWithNull(newEntry);

        axios.post(`http://localhost:5000/create/${selectedEntity}`, dataWithNulls)
            .then(res => {
                alert(res.data);
                handleReadData();
            }).catch(err => {
                console.error('Error creating data entry:', err);
            });
    };

    const handleUpdateData = (id) => {
        if (!validateMandatoryFields()) {
            alert('Please fill in all mandatory fields.');
            return;
        }

        const dataWithNulls = fillOptionalFieldsWithNull(newEntry);
        delete dataWithNulls.id; // Remove id field from updated data

        axios.put(`http://localhost:5000/update/${selectedEntity}/${id}`, dataWithNulls)
            .then(res => {
                alert(res.data);
                handleReadData();
            }).catch(err => {
                console.error('Error updating data entry:', err);
            });
    };

    const handleDeleteData = (id) => {
        axios.delete(`http://localhost:5000/delete/${selectedEntity}/${id}`)
            .then(res => {
                alert(res.data);
                handleReadData();
            }).catch(err => {
                console.error('Error deleting data entry:', err);
            });
    };

    const handleNewEntryChange = (e) => {
        setNewEntry({ ...newEntry, [e.target.name]: e.target.value });
    };

    const validateMandatoryFields = () => {
        for (let attr of entityAttributes) {
            if (attr.mandatory && !newEntry[attr.name]) {
                return false;
            }
        }
        return true;
    };

    const fillOptionalFieldsWithNull = (entry) => {
        const filledEntry = { ...entry };
        for (let attr of entityAttributes) {
            if (!attr.mandatory && !filledEntry[attr.name]) {
                filledEntry[attr.name] = null;
            }
        }
        return filledEntry;
    };

    return (
        <div>
            {entityData && (
                <div className='entity-ops-container'>
                    <h3>Entity Data - {selectedEntity}</h3>
                    <div className='create-entry'>
                        {entityAttributes.map((attr, index) => (
                            attr.name !== 'id' && (
                                <div key={index}>
                                    <input
                                        type="text"
                                        name={attr.name}
                                        placeholder={attr.mandatory ? `${attr.name} (required)` : attr.name}
                                        onChange={handleNewEntryChange}
                                    />
                                </div>
                            )
                        ))}
                        {selectedEntity && <button className='create-button' onClick={handleCreateData}>Create New Entry</button>}
                    </div>
                    <div className='entity-table'>
                        {!selectedEntity && <p>Press on <button className='other-button' style={{width:100}}>Read</button> in an Entity from Entities display</p>}
                        <table>
                            <thead>
                                <tr>
                                    {entityAttributes.map(attr => (
                                        <th key={attr.name}>{attr.name !== 'id' ? attr.name : 'Actions'}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {entityData.map((entry, index) => (
                                    <tr key={index}>
                                        {entityAttributes.map(attr => (
                                            <td key={attr.name}>
                                                {attr.name !== 'id' ? (
                                                    <input
                                                        type="text"
                                                        name={attr.name}
                                                        placeholder={attr.name}
                                                        defaultValue={entry[attr.name]}
                                                        onChange={handleNewEntryChange}
                                                    />
                                                ) : (
                                                    <div className='action-buttons'>
                                                        <button className='create-button' onClick={() => handleUpdateData(entry.id)}>Update</button>
                                                        <button className='delete-button' onClick={() => handleDeleteData(entry.id)}>Delete</button>
                                                    </div>
                                                )}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EntityOps;
