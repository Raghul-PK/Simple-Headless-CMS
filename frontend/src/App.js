import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
    const [entityName, setEntityName] = useState('');
    const [attributes, setAttributes] = useState([{ name: '', type: '' }]);
    const [entities, setEntities] = useState([]);
    const [selectedEntity, setSelectedEntity] = useState('');
    const [entityAttributes, setEntityAttributes] = useState([]);
    const [entityData, setEntityData] = useState([]);
    const [newEntry, setNewEntry] = useState({});

    useEffect(() => {
        fetchEntities();
    }, []);

    const fetchEntities = () => {
        axios.get('http://localhost:5000/entities')
            .then(res => setEntities(res.data))
            .catch(err => console.error('Error fetching entities:', err));
    };

    const handleEntityChange = (e) => setEntityName(e.target.value);

    const handleAttributeChange = (index, e) => {
        const values = [...attributes];
        values[index][e.target.name] = e.target.value;
        setAttributes(values);
    };

    const addAttribute = () => setAttributes([...attributes, { name: '', type: '' }]);

    const deleteAttribute = (index) => {
        const values = [...attributes];
        values.splice(index, 1);
        setAttributes(values);
    };

    const handleCreateEntity = () => {
        axios.post('http://localhost:5000/create-entity', {
            entityName,
            attributes
        }).then(res => {
            alert(res.data);
            fetchEntities();
        }).catch(err => {
            console.error('Error creating entity:', err);
        });
    };

    const handleDeleteEntity = () => {
        axios.delete(`http://localhost:5000/delete-entity/${selectedEntity}`)
            .then(res => {
                alert(res.data);
                setSelectedEntity('');
                setEntityAttributes([]);
                setEntityData([]);
                fetchEntities();
            }).catch(err => {
                console.error('Error deleting entity:', err);
            });
    };

    const handleNewEntryChange = (e) => {
        setNewEntry({ ...newEntry, [e.target.name]: e.target.value });
    };

    const handleCreateData = () => {
        axios.post(`http://localhost:5000/create/${selectedEntity}`, newEntry)
            .then(res => {
                alert(res.data);
                setNewEntry({});
                handleReadData();
            }).catch(err => {
                console.error('Error creating data entry:', err);
            });
    };

    const handleReadData = () => {
        axios.get(`http://localhost:5000/read/${selectedEntity}`)
            .then(res => setEntityData(res.data))
            .catch(err => console.error('Error reading data:', err));
    };

    const handleUpdateData = (id) => {
        const updatedEntry = { ...newEntry };
        delete updatedEntry.id; // Remove id field from updated data

        axios.put(`http://localhost:5000/update/${selectedEntity}/${id}`, updatedEntry)
            .then(res => {
                alert(res.data);
                setNewEntry({});
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

    const handleEntitySelect = (e) => {
        const entity = e.target.value;
        setSelectedEntity(entity);
        if (entity) {
            axios.get(`http://localhost:5000/attributes/${entity}`)
                .then(res => setEntityAttributes(res.data))
                .catch(err => console.error('Error fetching attributes:', err));
        } else {
            setEntityAttributes([]);
        }
    };

    return (
        <div>
            <h1>Rudimentary CMS</h1>


            <div>
                <h2>CRUD Operations</h2>
                <div>
                    <h3>Select Entity</h3>
                    <select onChange={handleEntitySelect} value={selectedEntity}>
                        <option value="">Select Entity</option>
                        {entities.map((entity, index) => (
                            <option key={index} value={entity}>{entity}</option>
                        ))}
                    </select>
                    <button onClick={handleReadData}>Fetch Data</button>
                    <button onClick={handleDeleteEntity} disabled={!selectedEntity}>Delete Entity</button>
                </div>

                {selectedEntity && (
                    <div>
                        <h3>Create New Entry</h3>
                        {entityAttributes.map((attr, index) => (
                            attr.name !== 'id' && (
                                <div key={index}>
                                    <input
                                        type="text"
                                        name={attr.name}
                                        placeholder={attr.name}
                                        onChange={handleNewEntryChange}
                                    />
                                </div>
                            )
                        ))}
                        <button onClick={handleCreateData}>Create Entry</button>
                    </div>
                )}

                {selectedEntity && (
                    <div>
                        <h3>Entity Data</h3>
                        {entityData.map((entry, index) => (
                            <div key={index}>
                                {entityAttributes.map(attr => (
                                    attr.name !== 'id' && (
                                        <div key={attr.name}>
                                            <input
                                                type="text"
                                                name={attr.name}
                                                placeholder={attr.name}
                                                defaultValue={entry[attr.name]}
                                                onChange={handleNewEntryChange}
                                            />
                                        </div>
                                    )
                                ))}
                                <button onClick={() => handleUpdateData(entry.id)}>Update Entry</button>
                                <button onClick={() => handleDeleteData(entry.id)}>Delete Entry</button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default App;
