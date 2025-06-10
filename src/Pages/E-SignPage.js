import { useEffect, useState } from 'react';
import axiosInstance from '../components/Axios';

const ESignPage = () => {
    const [formData, setFormData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const onEsign = async () => {
        try {
            const response = await axiosInstance.get(
                `Report/GetEsign?Propertycode=${JSON.parse(localStorage.getItem('SETPROPERTYCODE'))}&booksAppNo=${JSON.parse(localStorage.getItem('P_BOOKS_PROP_APPNO'))}`
            );

            // Assuming response.data contains the 'msg' value for the form submission
            const msgValue = response.data; // Adjust this if the 'msg' value is nested

            setFormData(msgValue);
        } catch (error) {
            console.error('Error fetching e-sign data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        onEsign();
    }, []);

    useEffect(() => {
        if (formData) {
            // Automatically submit the form once the data is set
            document.getElementById('autoSubmitForm').submit();
        }
    }, [formData]);

    return (
        <div>
            {isLoading ? (
                <p>Loading...</p> // Show loading message
            ) : (
                <form id="autoSubmitForm" action={formData.url} method="post" target="_parent">
                    <input type="hidden" name="msg" value={formData.eSignXML} /> 
                    <button type="submit" style={{ display: 'none' }}>Submit</button> 
                </form>
            )}
        </div>
    );
};

export default ESignPage;
