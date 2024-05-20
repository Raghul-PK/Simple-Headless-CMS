import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MyContext } from '../MyContext';

const EntityManager = () => {
    const [entityName, setEntityName] = useState('');
    const [attributes, setAttributes] = useState([{ name: '', type: '', mandatory: false }]);
    const [entities, setEntities] = useState([]);
    const [selectedEntityIndex, setSelectedEntityIndex] = useState(-1);

    const { selectedEntity, setSelectedEntity } = React.useContext(MyContext);

    useEffect(() => {
        fetchEntities();
        console.log(entities);
    }, []);

    const handleAttributeChange = (index, e) => {
        const values = [...attributes];
        values[index][e.target.name] = e.target.name === 'mandatory' ? e.target.checked : e.target.value;
        setAttributes(values);
    };

    const deleteAttribute = (index) => {
        const values = [...attributes];
        values.splice(index, 1);
        setAttributes(values);
    };

    const addAttribute = () => setAttributes([...attributes, { name: '', type: '', mandatory: false }]);

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

    const fetchEntities = () => {
        axios.get('http://localhost:5000/entities')
            .then(res => {
                setEntities(res.data);
            })
            .catch(err => console.error('Error fetching entities:', err));
    };

    const handleClickEntity = (index) => {
        let clickedEntity = entities[index];
        setSelectedEntityIndex(index);
        console.log(clickedEntity);
        setSelectedEntity(clickedEntity);
    };

    const handleDeleteEntity = (index) => {
        let deletedEntity = entities[index];
        axios.delete(`http://localhost:5000/delete-entity/${deletedEntity}`)
            .then(res => {
                alert(res.data);
                fetchEntities();
            }).catch(err => {
                console.error('Error deleting entity:', err);
            });
    };

    return (
        <div className="entity-manager-container">
            <div className='create-entity'>
                <h2>Create Entity</h2>
                <input
                    type="text"
                    placeholder="Entity Name"
                    value={entityName}
                    onChange={(e) => setEntityName(e.target.value)}
                />
                {attributes.map((attribute, index) => (
                    <div className='attribute-box' key={index}>
                        <input
                            type="text"
                            name="name"
                            placeholder="Attribute Name"
                            value={attribute.name}
                            onChange={e => handleAttributeChange(index, e)}
                        />
                        <select
                            name="type"
                            value={attribute.type}
                            onChange={e => handleAttributeChange(index, e)}
                        >
                            <option value="">Select Type</option>
                            <option value="varchar(255)">String</option>
                            <option value="int">Number</option>
                            <option value="date">Date</option>
                        </select>
                        <label>
                            Mandatory
                            <input
                                type="checkbox"
                                name="mandatory"
                                checked={attribute.mandatory}
                                onChange={e => handleAttributeChange(index, e)}
                            />
                        </label>
                        <button className='delete-button' onClick={() => deleteAttribute(index)}>Delete Attribute</button>
                    </div>
                ))}
                <button className='other-button' onClick={addAttribute}>Add Attribute</button>
                <button className='create-button' onClick={handleCreateEntity}>Create Entity</button>
            </div>

            <div className='entities-displayer'>
                <h2>Entities Display</h2>
                <div className='entities-selector-table'>
                    <table>
                        <thead>
                            <tr>
                                <th>Actions</th>
                                <th>Entity Name</th>
                            </tr>
                        </thead>
                        <tbody>
                            {entities && entities.map((entity, index) => (
                                <tr key={index}>
                                    <td>{entity}</td>
                                    <td>
                                        <button className='other-button' onClick={() => handleClickEntity(index)}>Read</button>
                                        <button className='delete-button' onClick={() => handleDeleteEntity(index)}>Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default EntityManager;
