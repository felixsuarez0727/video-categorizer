import { useState } from 'react';
import { fullUrl } from '../utils/constants';

const Loader = () => (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-40">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
    </div>
);

const Modal = ({ isOpen, onClose, reload }) => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [error, setError] = useState(null);

    const handleFileChange = (event) => {
        if (event.target.files && event.target.files.length > 0) {
            const selectedFile = event.target.files[0];
            if (selectedFile.type === 'video/mp4') {
                setFile(selectedFile);
                setError(null);
            } else {
                setError('Please select an MP4 file.');
                setFile(null);
            }
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (file) {
            setUploading(true);
            setError(null); 
            setUploadSuccess(false); 

            try {
                const formData = new FormData();
                formData.append('file', file);

                const response = await fetch(`${fullUrl}/v1/upload`, {
                    method: 'POST',
                    body: formData,
                });

                if (!response.ok) {
                    throw new Error('Upload failed.');
                }

                setUploadSuccess(true); 
                reload();

            } catch (error) {
                setError(error.message);
            } finally {
                setUploading(false);
            }
        }
    };

    const handleClose = () => {
        onClose();
        setFile(null);
        setUploading(false);
        setUploadSuccess(false);
        setError(null);
    };

    if (!isOpen) return null;

    return (
        <div className="relative">
            { uploading && <Loader />}
            <div className={`z-30 fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 ${uploading ? 'pointer-events-none' : ''}`}>
                <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
                    {uploadSuccess ? (
                        <div>
                            <h2 className="text-lg font-semibold mb-4">Upload Successful</h2>
                            <p className="mb-4">Your file has been uploaded successfully!</p>
                            <div className="flex justify-end">
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    className="px-4 py-2 bg-blue-500 text-white rounded"
                                >
                                    OK
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div>
                            <h2 className="text-lg font-semibold mb-4">Upload File</h2>
                            <form onSubmit={handleSubmit}>
                                <input
                                    type="file"
                                    accept="video/mp4"
                                    onChange={handleFileChange}
                                    className="mb-4 w-full"
                                />
                                {error && <p className="text-red-500 mb-4">{error}</p>}
                                <div className="flex justify-end">
                                    <button
                                        type="button"
                                        onClick={handleClose}
                                        className="mr-4 px-4 py-2 bg-gray-300 text-black rounded"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-blue-500 text-white rounded"
                                        disabled={uploading}
                                    >
                                        {uploading ? 'Uploading...' : 'Upload'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Modal;
